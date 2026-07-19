"""
Additional seed script — adds MORE sample Pune restaurants (on top of the
original 8 from seed_data.py) plus sample reviews, without duplicating
existing entries.

Usage:
    python database/seed_more_data.py

Safe to re-run: skips any restaurant whose name already exists.
"""

import os
import sys
from datetime import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from models import Restaurant, RestaurantImage, Amenity, RestaurantTable, Review, User

app = create_app()

MORE_RESTAURANTS = [
    {
        "name": "Copper Wok",
        "description": "Sizzling Indo-Chinese and Pan-Asian dishes served hot off the wok.",
        "address": "Aundh Road, Aundh",
        "area": "Aundh",
        "cuisine_type": "Chinese",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1300,
        "rating": 4.3,
        "total_reviews": 156,
        "opening_time": time(12, 0),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1552566626-52f8b828add9",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Parking", "Offers Available"],
        "tables": [(2, 6), (4, 6)],
    },
    {
        "name": "Saffron & Smoke",
        "description": "Mughlai and Awadhi cuisine with slow-cooked kebabs and biryanis.",
        "address": "East Street, Camp",
        "area": "Camp",
        "cuisine_type": "Mughlai",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1700,
        "rating": 4.6,
        "total_reviews": 389,
        "opening_time": time(12, 30),
        "closing_time": time(23, 30),
        "cover_image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
        "is_instant_booking": True,
        "amenities": ["Couple Friendly", "Parking", "Buffet"],
        "tables": [(2, 6), (4, 8), (6, 4)],
    },
    {
        "name": "The Garden Bistro",
        "description": "Al fresco European bistro tucked inside a leafy courtyard.",
        "address": "North Main Road, Koregaon Park",
        "area": "Koregaon Park",
        "cuisine_type": "European",
        "food_type": "Veg",
        "avg_budget_for_two": 2200,
        "rating": 4.5,
        "total_reviews": 201,
        "opening_time": time(11, 0),
        "closing_time": time(22, 30),
        "cover_image": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17",
        "is_instant_booking": False,
        "amenities": ["Outdoor Seating", "Couple Friendly", "Pet Friendly"],
        "tables": [(2, 8), (4, 6)],
    },
    {
        "name": "Punjabi Rasoi",
        "description": "No-frills, high-flavor Punjabi comfort food — makki di roti to butter chicken.",
        "address": "Karve Road, Kothrud",
        "area": "Kothrud",
        "cuisine_type": "North Indian",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1000,
        "rating": 4.4,
        "total_reviews": 298,
        "opening_time": time(11, 30),
        "closing_time": time(22, 0),
        "cover_image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Parking", "Buffet"],
        "tables": [(2, 10), (4, 10), (6, 4)],
    },
    {
        "name": "Sushi Bay",
        "description": "Fresh sushi, sashimi, and ramen in a minimalist Japanese setting.",
        "address": "Viman Nagar Road, Viman Nagar",
        "area": "Viman Nagar",
        "cuisine_type": "Japanese",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 2400,
        "rating": 4.7,
        "total_reviews": 176,
        "opening_time": time(12, 0),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1553621042-f6e147245754",
        "is_instant_booking": True,
        "amenities": ["Couple Friendly", "Parking"],
        "tables": [(2, 8), (4, 4)],
    },
    {
        "name": "Adarsh South Kitchen",
        "description": "Authentic Udupi-style dosas, idlis, and filter coffee since generations.",
        "address": "Tilak Road, Sadashiv Peth",
        "area": "Sadashiv Peth",
        "cuisine_type": "South Indian",
        "food_type": "Pure Veg",
        "avg_budget_for_two": 500,
        "rating": 4.5,
        "total_reviews": 512,
        "opening_time": time(7, 30),
        "closing_time": time(22, 0),
        "cover_image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Wheelchair Accessible", "Offers Available"],
        "tables": [(2, 12), (4, 8)],
    },
    {
        "name": "Smokehouse Diner",
        "description": "American BBQ, burgers, and loaded fries in a retro diner vibe.",
        "address": "Fergusson College Road, Deccan",
        "area": "Deccan",
        "cuisine_type": "American",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1500,
        "rating": 4.2,
        "total_reviews": 244,
        "opening_time": time(12, 0),
        "closing_time": time(23, 30),
        "cover_image": "https://images.unsplash.com/photo-1550547660-d9450f859349",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Live Music", "Offers Available"],
        "tables": [(2, 6), (4, 8), (8, 2)],
    },
    {
        "name": "Zen Vegan Bowl",
        "description": "Buddha bowls, smoothies, and plant-based comfort food.",
        "address": "Law College Road, Erandwane",
        "area": "Erandwane",
        "cuisine_type": "Continental",
        "food_type": "Vegan",
        "avg_budget_for_two": 1200,
        "rating": 4.3,
        "total_reviews": 87,
        "opening_time": time(8, 30),
        "closing_time": time(21, 30),
        "cover_image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        "is_instant_booking": False,
        "amenities": ["Outdoor Seating", "Wheelchair Accessible", "Offers Available"],
        "tables": [(2, 6), (4, 4)],
    },
    {
        "name": "The Rooftop Social",
        "description": "Trendy rooftop bar with small plates, cocktails, and DJ nights.",
        "address": "Senapati Bapat Road, Shivajinagar",
        "area": "SB Road",
        "cuisine_type": "Continental",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 2300,
        "rating": 4.4,
        "total_reviews": 421,
        "opening_time": time(17, 0),
        "closing_time": time(1, 30),
        "cover_image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        "is_instant_booking": True,
        "amenities": ["Rooftop", "Live Music", "Couple Friendly", "Offers Available"],
        "tables": [(2, 8), (4, 6), (8, 4)],
    },
    {
        "name": "Jain Satvik Kitchen",
        "description": "Sattvik, onion-garlic-free meals rooted in traditional Jain cooking.",
        "address": "Bajirao Road, Shukrawar Peth",
        "area": "Shukrawar Peth",
        "cuisine_type": "Gujarati",
        "food_type": "Jain",
        "avg_budget_for_two": 650,
        "rating": 4.6,
        "total_reviews": 143,
        "opening_time": time(11, 0),
        "closing_time": time(21, 30),
        "cover_image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Buffet", "Wheelchair Accessible"],
        "tables": [(2, 8), (4, 8)],
    },
    {
        "name": "Barcode Brewhouse",
        "description": "Microbrewery with craft beers on tap and a hearty pub-food menu.",
        "address": "Mundhwa Road, Kalyani Nagar",
        "area": "Kalyani Nagar",
        "cuisine_type": "Continental",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1900,
        "rating": 4.3,
        "total_reviews": 367,
        "opening_time": time(12, 0),
        "closing_time": time(0, 30),
        "cover_image": "https://images.unsplash.com/photo-1546622891-02b72025801e",
        "is_instant_booking": True,
        "amenities": ["Live Music", "Couple Friendly", "Parking", "Outdoor Seating"],
        "tables": [(2, 10), (4, 6), (8, 2)],
    },
    {
        "name": "Marathi Manus Thali",
        "description": "Home-style unlimited Maharashtrian thali — puran poli to solkadhi.",
        "address": "Tulshibaug Road, Budhwar Peth",
        "area": "Budhwar Peth",
        "cuisine_type": "Maharashtrian",
        "food_type": "Veg",
        "avg_budget_for_two": 600,
        "rating": 4.7,
        "total_reviews": 678,
        "opening_time": time(11, 30),
        "closing_time": time(15, 30),
        "cover_image": "https://images.unsplash.com/photo-1631515242808-497c3fbd3972",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Buffet", "Wheelchair Accessible", "Offers Available"],
        "tables": [(2, 10), (4, 12), (6, 6)],
    },
]

SAMPLE_REVIEW_COMMENTS = [
    (5, "Amazing experience! The ambience and food both were top notch."),
    (4, "Really good food, service was a bit slow during peak hours."),
    (5, "One of the best places we've booked through the app. Highly recommend."),
    (3, "Decent food but overpriced for the portion sizes."),
    (4, "Loved the vibe, will definitely come back with friends."),
]


def seed_more_restaurants():
    with app.app_context():
        amenity_lookup = {a.name: a for a in Amenity.query.all()}
        existing_names = {r.name for r in Restaurant.query.all()}

        added = 0
        for r in MORE_RESTAURANTS:
            if r["name"] in existing_names:
                continue

            restaurant = Restaurant(
                name=r["name"],
                description=r["description"],
                address=r["address"],
                area=r["area"],
                city="Pune",
                cuisine_type=r["cuisine_type"],
                food_type=r["food_type"],
                avg_budget_for_two=r["avg_budget_for_two"],
                rating=r["rating"],
                total_reviews=r["total_reviews"],
                opening_time=r["opening_time"],
                closing_time=r["closing_time"],
                cover_image=r["cover_image"],
                is_instant_booking=r["is_instant_booking"],
                is_active=True,
            )

            for amenity_name in r["amenities"]:
                amenity = amenity_lookup.get(amenity_name)
                if amenity:
                    restaurant.amenities.append(amenity)

            restaurant.images.append(RestaurantImage(image_url=r["cover_image"]))

            for capacity, count in r["tables"]:
                for _ in range(count):
                    restaurant.tables.append(
                        RestaurantTable(table_type="Indoor", capacity=capacity)
                    )

            db.session.add(restaurant)
            added += 1

        db.session.commit()
        print(f"Added {added} new restaurants (skipped {len(MORE_RESTAURANTS) - added} duplicates).")


def seed_sample_reviews():
    """Attaches a few sample reviews to existing restaurants, using existing users.
    Skips entirely if there are no users or no restaurants yet (register a user first).
    """
    with app.app_context():
        users = User.query.limit(5).all()
        restaurants = Restaurant.query.all()

        if not users:
            print("No users found — skipping review seeding. Register at least one user first.")
            return
        if not restaurants:
            print("No restaurants found — skipping review seeding.")
            return

        if Review.query.count() > 0:
            print("Reviews already exist — skipping to avoid duplicates.")
            return

        count = 0
        for i, restaurant in enumerate(restaurants):
            user = users[i % len(users)]
            rating, comment = SAMPLE_REVIEW_COMMENTS[i % len(SAMPLE_REVIEW_COMMENTS)]
            review = Review(
                user_id=user.user_id,
                restaurant_id=restaurant.restaurant_id,
                rating=rating,
                comment=comment,
            )
            db.session.add(review)
            count += 1

        db.session.commit()
        print(f"Added {count} sample reviews.")


if __name__ == "__main__":
    seed_more_restaurants()
    seed_sample_reviews()