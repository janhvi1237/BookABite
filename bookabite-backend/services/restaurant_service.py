from repositories import RestaurantRepository
from utils.exceptions import NotFoundError


class RestaurantService:
    """Business logic for restaurant listing and detail retrieval.
    Currently thin (mostly delegates to the repository), but this is where
    filtering, sorting, and search-ranking logic will live as those features
    are added (cuisine, budget, rating, amenities, distance, etc.).
    """

    @staticmethod
    def list_restaurants(city="Pune"):
        city = (city or "Pune").strip()
        restaurants = RestaurantRepository.find_all_active(city=city)
        return [r.to_dict() for r in restaurants]

    @staticmethod
    def get_restaurant(restaurant_id):
        restaurant = RestaurantRepository.find_by_id(restaurant_id)
        if not restaurant or not restaurant.is_active:
            raise NotFoundError("Restaurant not found.")
        return restaurant.to_dict()
