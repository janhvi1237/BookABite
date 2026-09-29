from repositories import RestaurantRepository
from utils.exceptions import NotFoundError


class RestaurantService:
    """Business logic layer for restaurants — orchestrates repository calls
    and shapes the response. No direct DB access here.
    """

    @staticmethod
    def list_restaurants(city="Pune"):
        restaurants = RestaurantRepository.find_all_active(city=city)
        return [r.to_dict() for r in restaurants]

    @staticmethod
    def get_restaurant(restaurant_id):
        restaurant = RestaurantRepository.find_by_id(restaurant_id)
        if not restaurant:
            raise NotFoundError(f"Restaurant with id {restaurant_id} not found.")
        return restaurant.to_dict()