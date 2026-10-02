"""Create (or promote) an admin account.

Usage (from the bookabite-backend folder, venv active):
    python database/create_admin.py admin@bookabite.com "YourPassword1" "Admin Name"

If the email already exists, that account is promoted to admin (password unchanged).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db, bcrypt
from models import User

app = create_app()


def main():
    if len(sys.argv) < 3:
        print('Usage: python database/create_admin.py <email> <password> ["Full Name"]')
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    password = sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else "BookABite Admin"

    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if user:
            user.role = "admin"
            user.is_admin = True
            db.session.commit()
            print(f"Existing account {email} is now an admin.")
            return

        if len(password) < 8:
            print("Password must be at least 8 characters.")
            sys.exit(1)

        user = User(
            full_name=full_name,
            email=email,
            password_hash=bcrypt.generate_password_hash(password).decode("utf-8"),
            role="admin",
            is_admin=True,
        )
        db.session.add(user)
        db.session.commit()
        print(f"Admin created: {email}")


if __name__ == "__main__":
    main()
