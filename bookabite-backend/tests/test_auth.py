def test_demo_owner_seed_restores_login_credentials(app):
    from extensions import bcrypt, db
    from models.user import User
    from services.auth_service import AuthService
    from database.migrate_and_seed_menu import ensure_demo_owner

    existing_owner = User(
        full_name="Demo Owner",
        email="owner@bookabite.com",
        password_hash=bcrypt.generate_password_hash("OldPassword@123").decode(),
        role="customer",
        is_admin=False,
        is_approved=False,
    )
    db.session.add(existing_owner)
    db.session.commit()
    owner_id = existing_owner.user_id

    seeded_owner = ensure_demo_owner()
    login = AuthService.login({
        "email": "owner@bookabite.com",
        "password": "Password@123",
    })

    assert seeded_owner.user_id == owner_id
    assert seeded_owner.role == "owner"
    assert seeded_owner.is_approved is True
    assert login["user"]["user_id"] == owner_id


def test_demo_diner_seed_creates_and_restores_login_credentials(app):
    from database.migrate_and_seed_menu import ensure_demo_diner
    from extensions import bcrypt, db
    from models.user import User
    from services.auth_service import AuthService

    existing_diner = User(
        full_name="Old Demo User",
        email="diner@bookabite.com",
        password_hash=bcrypt.generate_password_hash("OldPassword@123").decode(),
        role="owner",
        is_admin=False,
        is_approved=False,
    )
    db.session.add(existing_diner)
    db.session.commit()
    diner_id = existing_diner.user_id

    seeded_diner = ensure_demo_diner()
    login = AuthService.login({
        "email": "diner@bookabite.com",
        "password": "Password@123",
    })

    assert seeded_diner.user_id == diner_id
    assert seeded_diner.role == "customer"
    assert seeded_diner.is_approved is True
    assert login["user"]["user_id"] == diner_id


def test_demo_diner_seed_creates_account_if_missing(app):
    from database.migrate_and_seed_menu import ensure_demo_diner
    from services.auth_service import AuthService

    diner = ensure_demo_diner()
    login = AuthService.login({
        "email": "diner@bookabite.com",
        "password": "Password@123",
    })

    assert diner.role == "customer"
    assert login["user"]["user_id"] == diner.user_id
