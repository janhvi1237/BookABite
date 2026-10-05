import hashlib
import hmac
import smtplib
from email.message import EmailMessage
from urllib.parse import urlencode

from flask import current_app
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from extensions import bcrypt, db
from models.user import User
from utils.validators import validate_password

GENERIC_REQUEST_MESSAGE = (
    "If an account exists for that email, a password reset link will be sent."
)


def mail_is_configured():
    return bool(
        current_app.config.get("MAIL_SERVER")
        and current_app.config.get("MAIL_DEFAULT_SENDER")
        and current_app.config.get("PASSWORD_RESET_FRONTEND_URL")
    )


def _serializer():
    return URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"],
        salt="bookabite-password-reset-v1",
    )


def _password_fingerprint(user):
    secret = current_app.config["SECRET_KEY"].encode("utf-8")
    return hmac.new(secret, user.password_hash.encode("utf-8"), hashlib.sha256).hexdigest()


def create_reset_token(user):
    return _serializer().dumps({
        "user_id": user.user_id,
        "password_fingerprint": _password_fingerprint(user),
    })


def send_reset_email(user, token):
    reset_url = (
        current_app.config["PASSWORD_RESET_FRONTEND_URL"].rstrip("/")
        + "/forgot-password?"
        + urlencode({"token": token})
    )
    message = EmailMessage()
    message["Subject"] = "Reset your BookABite password"
    message["From"] = current_app.config["MAIL_DEFAULT_SENDER"]
    message["To"] = user.email
    message.set_content(
        f"Hello {user.full_name},\n\n"
        "We received a request to reset your BookABite password. "
        "Use the link below within one hour to choose a new password:\n\n"
        f"{reset_url}\n\n"
        "If you did not request this, you can ignore this email. "
        "Your current password will remain unchanged.\n"
    )

    server = current_app.config["MAIL_SERVER"]
    port = current_app.config["MAIL_PORT"]
    username = current_app.config.get("MAIL_USERNAME")
    password = current_app.config.get("MAIL_PASSWORD")
    timeout = 10

    if current_app.config.get("MAIL_USE_SSL"):
        with smtplib.SMTP_SSL(server, port, timeout=timeout) as smtp:
            if username:
                smtp.login(username, password or "")
            smtp.send_message(message)
        return

    with smtplib.SMTP(server, port, timeout=timeout) as smtp:
        if current_app.config.get("MAIL_USE_TLS"):
            smtp.starttls()
        if username:
            smtp.login(username, password or "")
        smtp.send_message(message)


def request_password_reset(email):
    normalized_email = email.strip().lower()
    user = User.query.filter(db.func.lower(User.email) == normalized_email).first()
    if user:
        send_reset_email(user, create_reset_token(user))


def reset_password(token, new_password):
    validation_error = validate_password(new_password)
    if validation_error:
        return {"error": validation_error}, 400

    try:
        payload = _serializer().loads(
            token,
            max_age=current_app.config["PASSWORD_RESET_TOKEN_MAX_AGE"],
        )
        user_id = int(payload["user_id"])
        token_fingerprint = payload["password_fingerprint"]
    except (BadSignature, SignatureExpired, KeyError, TypeError, ValueError):
        return {"error": "This password reset link is invalid or has expired."}, 400

    user = User.query.get(user_id)
    if (
        not user
        or not isinstance(token_fingerprint, str)
        or not hmac.compare_digest(token_fingerprint, _password_fingerprint(user))
    ):
        return {"error": "This password reset link is invalid or has expired."}, 400

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    return {"message": "Your password has been reset. You can now sign in."}, 200
