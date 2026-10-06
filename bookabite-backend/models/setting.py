from extensions import db


class Setting(db.Model):
    """Admin-editable key/value settings (fees etc.)."""
    __tablename__ = "Settings"

    key = db.Column("setting_key", db.String(60), primary_key=True)
    value = db.Column("setting_value", db.String(100), nullable=False)
