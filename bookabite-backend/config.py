import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Base configuration. Reads DB and app secrets from environment variables.
    Uses pyodbc driver to connect Flask/SQLAlchemy to MS SQL Server.
    """

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")

    DB_SERVER = os.getenv("DB_SERVER", "localhost")
    DB_NAME = os.getenv("DB_NAME", "BookABiteDB")
    DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")

    # Set DB_AUTH=windows to use Windows Authentication (Trusted Connection) —
    # no username/password needed, uses whichever Windows account is running
    # this app. This is the simplest option for local development.
    # Set DB_AUTH=sql to use SQL Server Authentication with DB_USER/DB_PASSWORD.
    DB_AUTH = os.getenv("DB_AUTH", "windows").lower()

    if DB_AUTH == "windows":
        SQLALCHEMY_DATABASE_URI = (
            f"mssql+pyodbc://{DB_SERVER}/{DB_NAME}"
            f"?driver={DB_DRIVER.replace(' ', '+')}&trusted_connection=yes"
        )
    else:
        DB_USER = os.getenv("DB_USER", "sa")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
        SQLALCHEMY_DATABASE_URI = (
            f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}"
            f"?driver={DB_DRIVER.replace(' ', '+')}"
        )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = 24

    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    JSON_SORT_KEYS = False