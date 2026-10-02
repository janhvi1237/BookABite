"""Test setup: runs the real Flask app against an in-memory SQLite database,
so the booking tests need NO SQL Server and never touch your real data."""
import os
import sys
from datetime import time

import pytest
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config  # noqa: E402


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_ENGINE_OPTIONS = {
        "poolclass": StaticPool,
        "connect_args": {"check_same_thread": False},
    }
    JWT_SECRET_KEY = "test-secret-key-that-is-long-enough-32b"
    SECRET_KEY = "test-secret"


@pytest.fixture()
def app(monkeypatch):
    import app as app_module

    monkeypatch.setattr(app_module, "Config", TestConfig)
    flask_app = app_module.create_app()

    from extensions import db

    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _make_user(app, email, role="customer", approved=True):
    from extensions import db, bcrypt
    from models.user import User
    from flask_jwt_extended import create_access_token

    with app.app_context():
        user = User(
            full_name=email.split("@")[0].title(),
            email=email,
            password_hash=bcrypt.generate_password_hash("Passw0rd!").decode(),
            role=role,
            is_approved=approved,
        )
        db.session.add(user)
        db.session.commit()
        return user.user_id, {"Authorization": f"Bearer {create_access_token(identity=str(user.user_id))}"}


@pytest.fixture()
def customer(app):
    return _make_user(app, "alice@example.com")


@pytest.fixture()
def other_customer(app):
    return _make_user(app, "bob@example.com")


@pytest.fixture()
def owner(app):
    return _make_user(app, "owner@example.com", role="owner")


@pytest.fixture()
def other_owner(app):
    return _make_user(app, "owner2@example.com", role="owner")


@pytest.fixture()
def admin(app):
    return _make_user(app, "admin@example.com", role="admin")


@pytest.fixture()
def restaurant(app, owner):
    """Open 10:00-22:00, two tables of 4 seats = capacity 8."""
    from extensions import db
    from models.restaurant import Restaurant, RestaurantTable

    with app.app_context():
        r = Restaurant(
            name="Test Bistro", address="1 Test Road", owner_id=owner[0],
            opening_time=time(10, 0), closing_time=time(22, 0), is_active=True,
        )
        db.session.add(r)
        db.session.flush()
        db.session.add_all([
            RestaurantTable(restaurant_id=r.restaurant_id, table_type="Indoor", capacity=4),
            RestaurantTable(restaurant_id=r.restaurant_id, table_type="Indoor", capacity=4),
        ])
        db.session.commit()
        return r.restaurant_id
