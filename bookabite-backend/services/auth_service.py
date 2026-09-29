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
    """Business logic + validation for registration and login.
    No direct DB queries here — those go through UserRepository.
    """

    @staticmethod
    def register(data):
        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone")

        errors = validate_required_fields(data, ["full_name", "email", "password"])

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

        email = email.strip().lower()

        if UserRepository.find_by_email(email):
            raise ConflictError(
                "An account with this email already exists.",
                errors={"email": "Email already registered."},
            )

        if phone and UserRepository.find_by_phone(phone):
            raise ConflictError(
                "An account with this phone number already exists.",
                errors={"phone": "Phone already registered."},
            )

        role = data.get("role", "customer")
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        user = UserRepository.create(
            full_name=full_name.strip(),
            email=email,
            phone=phone,
            password_hash=password_hash,
            role=role,
        )

        token = create_access_token(identity=str(user.user_id))
        return {"token": token, "user": user.to_dict()}

    @staticmethod
    def login(data):
        email = data.get("email")
        password = data.get("password")

        errors = validate_required_fields(data, ["email", "password"])
        if errors:
            raise ValidationError("Please fix the errors below.", errors=errors)

        user = UserRepository.find_by_email(email.strip().lower())
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            raise AuthError("Invalid email or password.")

        token = create_access_token(identity=str(user.user_id))
        return {"token": token, "user": user.to_dict()}

    @staticmethod
    def get_profile(user_id):
        user = UserRepository.find_by_id(user_id)
        if not user:
            raise AuthError("User not found.")
        return user.to_dict()

    @staticmethod
    def update_profile(user_id, data):
        user = UserRepository.find_by_id(user_id)
        if not user:
            raise AuthError("User not found.")
        if "full_name" in data and data["full_name"]:
            user.full_name = data["full_name"].strip()
        if "phone" in data:
            user.phone = data["phone"].strip() if data["phone"] else None
        if "profile_image" in data:
            user.profile_image = data["profile_image"]
        from extensions import db
        db.session.commit()
        return user.to_dict()