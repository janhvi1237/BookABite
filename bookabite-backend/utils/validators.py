import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^(\+91[-\s]?)?[6-9]\d{9}$")  # Indian mobile numbers


def validate_required_fields(data, required_fields):
    """Returns a dict of {field: 'This field is required.'} for any missing/empty fields."""
    errors = {}
    for field in required_fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            errors[field] = "This field is required."
    return errors


def validate_email(email):
    if not email or not EMAIL_REGEX.match(email.strip()):
        return "Enter a valid email address."
    return None


def validate_password(password):
    if not password or len(password) < 8:
        return "Password must be at least 8 characters long."
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        return "Password must contain at least one letter and one number."
    return None


def validate_phone(phone):
    """Phone is optional at registration, but if provided, must be a valid Indian mobile number."""
    if phone and not PHONE_REGEX.match(phone.strip()):
        return "Enter a valid 10-digit Indian mobile number."
    return None


def validate_full_name(name):
    if not name or len(name.strip()) < 2:
        return "Name must be at least 2 characters long."
    if len(name.strip()) > 100:
        return "Name is too long (max 100 characters)."
    if not re.match(r"^[A-Za-z\s.'-]+$", name.strip()):
        return "Name can only contain letters, spaces, and basic punctuation."
    return None


def validate_rating(rating):
    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return "Rating must be a whole number between 1 and 5."
    if rating < 1 or rating > 5:
        return "Rating must be between 1 and 5."
    return None
