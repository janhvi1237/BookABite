class AppError(Exception):
    """Base exception for all application-level errors. Carries an HTTP status code."""

    status_code = 500

    def __init__(self, message, status_code=None, errors=None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.errors = errors or {}

    def to_dict(self):
        payload = {"error": self.message}
        if self.errors:
            payload["details"] = self.errors
        return payload


class ValidationError(AppError):
    """Raised when input data fails validation (missing fields, bad format, etc.)."""

    status_code = 400


class ConflictError(AppError):
    """Raised when a request conflicts with existing data (e.g. duplicate email)."""

    status_code = 409


class AuthError(AppError):
    """Raised when authentication fails (bad credentials, invalid/expired token)."""

    status_code = 401


class ForbiddenError(AppError):
    """Raised when the user is logged in but their role is not allowed to do this."""

    status_code = 403


class NotFoundError(AppError):
    """Raised when a requested resource doesn't exist."""

    status_code = 404
