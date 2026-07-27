from extensions import db
from models import User


class UserRepository:
    """Handles all direct database access for the User entity.
    No business logic or validation here — just queries and persistence.
    """

    @staticmethod
    def find_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def find_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def find_by_phone(phone):
        return User.query.filter_by(phone=phone).first()

    @staticmethod
    def create(full_name, email, phone, password_hash):
        user = User(
            full_name=full_name,
            email=email,
            phone=phone,
            password_hash=password_hash,
        )
        db.session.add(user)
        db.session.commit()
        return user
