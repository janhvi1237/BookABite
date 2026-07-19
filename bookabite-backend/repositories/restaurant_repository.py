from models import Restaurant


class RestaurantRepository:
    """Handles all direct database access for the Restaurant entity."""

    @staticmethod
    def find_all_active(city="Pune"):
        return Restaurant.query.filter_by(city=city, is_active=True).all()

    @staticmethod
    def find_by_id(restaurant_id):
        return Restaurant.query.get(restaurant_id)
