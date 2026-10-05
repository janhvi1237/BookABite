from services.password_reset_service import create_reset_token
from models.user import User


def test_forgot_password_returns_generic_message_and_sends_for_existing_user(
    app, client, customer, monkeypatch
):
    import routes.auth_routes as auth_routes
    import services.password_reset_service as reset_service

    sent_to = []
    monkeypatch.setattr(auth_routes, "mail_is_configured", lambda: True)
    monkeypatch.setattr(reset_service, "send_reset_email", lambda user, token: sent_to.append(user.email))

    response = client.post("/api/auth/password/forgot", json={"email": "ALICE@example.com"})
    assert response.status_code == 200
    assert response.get_json()["message"] == (
        "If an account exists for that email, a password reset link will be sent."
    )
    assert sent_to == ["alice@example.com"]


def test_forgot_password_does_not_disclose_unknown_email(app, client, monkeypatch):
    import routes.auth_routes as auth_routes
    import services.password_reset_service as reset_service

    requested = []
    monkeypatch.setattr(auth_routes, "mail_is_configured", lambda: True)
    monkeypatch.setattr(reset_service, "send_reset_email", lambda user, token: requested.append(user.email))

    response = client.post("/api/auth/password/forgot", json={"email": "missing@example.com"})
    assert response.status_code == 200
    assert "If an account exists" in response.get_json()["message"]
    assert requested == []


def test_forgot_password_requires_configured_mail_and_valid_email(client):
    assert client.post(
        "/api/auth/password/forgot", json={"email": "not-an-email"}
    ).status_code == 400
    assert client.post(
        "/api/auth/password/forgot", json={"email": "alice@example.com"}
    ).status_code == 503


def test_reset_password_changes_password_and_token_is_single_use(app, client, customer):
    with app.app_context():
        token = create_reset_token(User.query.get(customer[0]))

    response = client.post(
        "/api/auth/password/reset",
        json={"token": token, "password": "NewPass123"},
    )
    assert response.status_code == 200
    assert client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "NewPass123"},
    ).status_code == 200

    replay = client.post(
        "/api/auth/password/reset",
        json={"token": token, "password": "AnotherPass456"},
    )
    assert replay.status_code == 400


def test_reset_password_rejects_invalid_expired_tokens_and_weak_passwords(
    app, client, customer
):
    with app.app_context():
        user = User.query.get(customer[0])
        token = create_reset_token(user)
        app.config["PASSWORD_RESET_TOKEN_MAX_AGE"] = -1

    expired = client.post(
        "/api/auth/password/reset",
        json={"token": token, "password": "NewPass123"},
    )
    assert expired.status_code == 400

    app.config["PASSWORD_RESET_TOKEN_MAX_AGE"] = 3600
    weak = client.post(
        "/api/auth/password/reset",
        json={"token": token, "password": "short"},
    )
    assert weak.status_code == 400
    assert weak.get_json()["error"] == "Password must be at least 8 characters long."
