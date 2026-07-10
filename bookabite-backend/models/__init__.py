from .user import User
from .restaurant import Restaurant, RestaurantImage, Amenity, RestaurantTable
from .booking import Booking
from .payment import Payment
from .review import Review
from .coupon import Coupon
from .favorite import Favorite
from .scratch_card import ScratchCard

__all__ = [
    "User",
    "Restaurant",
    "RestaurantImage",
    "Amenity",
    "RestaurantTable",
    "Booking",
    "Payment",
    "Review",
    "Coupon",
    "Favorite",
    "ScratchCard",
]
