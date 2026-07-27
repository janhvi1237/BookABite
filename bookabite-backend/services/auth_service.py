from flask_jwt_extended import create_access_token
from extensions import bcrypt
from repositories import UserRepository
from utils.exceptions import ValidationError, ConflictError, AuthError
from utils.validators import (
    validate_required_fields,
    validate_email,
    validate_password,
    validate_phone,
    validate_full_name,
)


class AuthService:
    """Business logic for user registration and login.
    Validates input, enforces rules, and talks to the repository layer.
    Never touches Flask request/response objects directly — that's the controller's job.
    """

    @staticmethod
    def register(data):
        errors = validate_required_fields(data, ["full_name", "email", "password"])

        full_name = (data.get("full_name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        phone = (data.get("phone") or "").strip() or None

        if "full_name" not in errors:
            name_error = validate_full_name(full_name)
            if name_error:
                errors["full_name"] = name_error

        if "email" not in errors:
            email_error = validate_email(email)
            if email_error:
                errors["email"] = email_error

        if "password" not in errors:
            password_error = validate_password(password)
            if password_error:
                errors["password"] = password_error

        phone_error = validate_phone(phone)
        if phone_error:
            errors["phone"] = phone_error

        if errors:
            raise ValidationError("Please fix the errors below.", errors=errors)

        if UserRepository.find_by_email(email):
            raise ConflictError("An account with this email already exists.")

        if phone and UserRepository.find_by_phone(phone):
            raise ConflictError("An account with this phone number already exists.")

        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        user = UserRepository.create(
            full_name=full_name, email=email, phone=phone, password_hash=password_hash
        )

        token = create_access_token(identity=user.user_id)
        return {"token": token, "user": user.to_dict()}

    @staticmethod
    def login(data):
        errors = validate_required_fields(data, ["email", "password"])
        if errors:
            raise ValidationError("Please fix the errors below.", errors=errors)

        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        user = UserRepository.find_by_email(email)
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            raise AuthError("Invalid email or password.")

        token = create_access_token(identity=user.user_id)
        return {"token": token, "user": user.to_dict()}
