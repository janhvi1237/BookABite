"""Login + role protection for API routes.

The logged-in person is ALWAYS taken from the JWT token (never from user_id /
owner_id sent by the browser), so nobody can pretend to be someone else.
"""
from functools import wraps

from flask import g, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from utils.exceptions import AuthError, ForbiddenError

ROLE_CUSTOMER = "customer"
ROLE_OWNER = "owner"
ROLE_ADMIN = "admin"


def role_of(user):
    """customer / owner / admin (also understands the old is_admin flag)."""
    if user.role == ROLE_ADMIN or user.is_admin:
        return ROLE_ADMIN
    return user.role or ROLE_CUSTOMER


def is_admin(user):
    return role_of(user) == ROLE_ADMIN


def _load_user_from_token():
    from models.user import User  # imported here to avoid circular imports

    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
    except Exception as error:
        if error.__class__.__name__ == "ExpiredSignatureError":
            raise AuthError("Your session has expired. Please log in again.")
        raise AuthError("Please log in to continue.")

    user = User.query.get(user_id)
    if not user:
        raise AuthError("Account not found. Please log in again.")
    g.current_user = user
    return user


def login_required(fn):
    """Any logged-in user (customer, owner or admin)."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        _load_user_from_token()
        return fn(*args, **kwargs)

    return wrapper


def roles_required(*allowed_roles):
    """Only the listed roles, e.g. @roles_required("owner", "admin").
    The role is read from the DATABASE on every request, so a role change
    takes effect immediately."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = _load_user_from_token()
            role = role_of(user)
            if role not in allowed_roles:
                raise ForbiddenError("You do not have permission to do this.")
            if role == ROLE_OWNER and user.is_approved is False:
                raise ForbiddenError("Your owner account is waiting for admin approval.")
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def optional_user():
    """The logged-in user, or None for visitors who are not logged in."""
    from models.user import User

    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return User.query.get(int(identity)) if identity else None
    except Exception:
        return None


def current_user():
    """The logged-in User (only inside a route that used a decorator above)."""
    return g.current_user


def can_manage_restaurant(user, restaurant):
    """Admin can manage any restaurant; an owner only their own."""
    return is_admin(user) or restaurant.owner_id == user.user_id


def forbidden(message="You do not have permission to do this."):
    """Ready-made 403 response for use inside routes that have their own try/except."""
    return jsonify({"error": message}), 403
