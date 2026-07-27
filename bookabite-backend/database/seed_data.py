"""
Seed script — populates BookABiteDB with sample Pune restaurant data.

Usage:
    python seed_data.py

Run this AFTER schema.sql has created the database/tables, and AFTER
your .env is pointing at the right SQL Server instance.
"""

import os
import sys
from datetime import time, date

# Ensure the project root (parent of this database/ folder) is on sys.path
# so `app`, `extensions`, and `models` can be imported regardless of the
# directory this script is run from.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from models import Restaurant, RestaurantImage, Amenity, RestaurantTable, Coupon

app = create_app()

# ------------------------------------------------------------------
# Sample restaurant data — real Pune neighborhoods, varied cuisines
# ------------------------------------------------------------------
RESTAURANTS = [
    {
        "name": "The Spice Terrace",
        "description": "Rooftop dining with skyline views, known for North Indian and tandoor specialties.",
        "address": "2nd Floor, North Main Road, Koregaon Park",
        "area": "Koregaon Park",
        "cuisine_type": "North Indian",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1800,
        "rating": 4.5,
        "total_reviews": 342,
        "opening_time": time(12, 0),
        "closing_time": time(23, 30),
        "cover_image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        "is_instant_booking": True,
        "amenities": ["Rooftop", "Live Music", "Couple Friendly", "Parking"],
        "tables": [(2, 6), (4, 8), (6, 4)],
    },
    {
        "name": "Green Leaf Kitchen",
        "description": "Pure vegetarian multi-cuisine restaurant with a calm garden seating area.",
        "address": "FC Road, Shivajinagar",
        "area": "FC Road",
        "cuisine_type": "Multi-Cuisine",
        "food_type": "Pure Veg",
        "avg_budget_for_two": 900,
        "rating": 4.3,
        "total_reviews": 210,
        "opening_time": time(11, 0),
        "closing_time": time(22, 30),
        "cover_image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        "is_instant_booking": True,
        "amenities": ["Outdoor Seating", "Family Friendly", "Wheelchair Accessible"],
        "tables": [(2, 10), (4, 6)],
    },
    {
        "name": "Bombay Brasserie",
        "description": "Contemporary Indian fine dining with a curated cocktail menu.",
        "address": "Boat Club Road, Model Colony",
        "area": "Model Colony",
        "cuisine_type": "Indian Fusion",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 2500,
        "rating": 4.7,
        "total_reviews": 501,
        "opening_time": time(12, 30),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17",
        "is_instant_booking": False,
        "amenities": ["Couple Friendly", "Parking", "Live Music"],
        "tables": [(2, 8), (4, 4), (8, 2)],
    },
    {
        "name": "Pasta & Pane",
        "description": "Cozy Italian trattoria with wood-fired pizzas and handmade pasta.",
        "address": "Lane 5, Koregaon Park",
        "area": "Koregaon Park",
        "cuisine_type": "Italian",
        "food_type": "Veg",
        "avg_budget_for_two": 1600,
        "rating": 4.4,
        "total_reviews": 275,
        "opening_time": time(12, 0),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1481931098730-318b6f776db0",
        "is_instant_booking": True,
        "amenities": ["Outdoor Seating", "Couple Friendly", "Offers Available"],
        "tables": [(2, 6), (4, 5)],
    },
    {
        "name": "Jain Bhoj Thali House",
        "description": "Traditional Jain thali served in a homely, no-onion-no-garlic kitchen.",
        "address": "Tilak Road, Sadashiv Peth",
        "area": "Sadashiv Peth",
        "cuisine_type": "Maharashtrian",
        "food_type": "Jain",
        "avg_budget_for_two": 700,
        "rating": 4.6,
        "total_reviews": 189,
        "opening_time": time(11, 30),
        "closing_time": time(22, 0),
        "cover_image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Buffet", "Wheelchair Accessible"],
        "tables": [(2, 8), (4, 10), (6, 4)],
    },
    {
        "name": "The Vegan Table",
        "description": "100% plant-based menu with a focus on seasonal, locally-sourced produce.",
        "address": "Baner Road, Baner",
        "area": "Baner",
        "cuisine_type": "Continental",
        "food_type": "Vegan",
        "avg_budget_for_two": 1400,
        "rating": 4.2,
        "total_reviews": 98,
        "opening_time": time(9, 0),
        "closing_time": time(21, 30),
        "cover_image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        "is_instant_booking": False,
        "amenities": ["Outdoor Seating", "Pet Friendly", "Offers Available"],
        "tables": [(2, 6), (4, 4)],
    },
    {
        "name": "Nightowl Grill & Bar",
        "description": "Late-night grill spot with live music on weekends and a buzzing bar scene.",
        "address": "SB Road, Shivajinagar",
        "area": "SB Road",
        "cuisine_type": "Continental",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 2000,
        "rating": 4.1,
        "total_reviews": 412,
        "opening_time": time(17, 0),
        "closing_time": time(1, 0),
        "cover_image": "https://images.unsplash.com/photo-1544148103-0773bf10d330",
        "is_instant_booking": True,
        "amenities": ["Live Music", "Couple Friendly", "Parking", "Offers Available"],
        "tables": [(2, 10), (4, 6), (8, 2)],
    },
    {
        "name": "Paw-some Cafe",
        "description": "Pet-friendly cafe with a big lawn, comfort food, and weekend brunch specials.",
        "address": "Prabhat Road, Deccan Gymkhana",
        "area": "Deccan",
        "cuisine_type": "Cafe",
        "food_type": "Veg",
        "avg_budget_for_two": 1100,
        "rating": 4.5,
        "total_reviews": 267,
        "opening_time": time(8, 0),
        "closing_time": time(22, 0),
        "cover_image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
        "is_instant_booking": True,
        "amenities": ["Pet Friendly", "Outdoor Seating", "Family Friendly"],
        "tables": [(2, 8), (4, 8)],
    },
]

COUPONS = [
    {
        "code": "WELCOME50",
        "description": "Flat ₹50 off on your first booking",
        "discount_type": "Flat",
        "discount_value": 50,
        "min_booking_amount": 200,
        "valid_from": date(2026, 1, 1),
        "valid_until": date(2026, 12, 31),
        "usage_limit": 1000,
    },
    {
        "code": "WEEKEND20",
        "description": "20% off on weekend bookings, up to ₹300",
        "discount_type": "Percentage",
        "discount_value": 20,
        "min_booking_amount": 500,
        "max_discount": 300,
        "valid_from": date(2026, 1, 1),
        "valid_until": date(2026, 12, 31),
        "usage_limit": 500,
    },
]


def seed():
    with app.app_context():
        # Build a lookup of existing amenities (schema.sql already seeded the base list)
        amenity_lookup = {a.name: a for a in Amenity.query.all()}

        if Restaurant.query.count() > 0:
            print("Restaurants already exist — skipping seed to avoid duplicates.")
            return

        for r in RESTAURANTS:
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

            # Attach amenities
            for amenity_name in r["amenities"]:
                amenity = amenity_lookup.get(amenity_name)
                if amenity:
                    restaurant.amenities.append(amenity)

            # Attach gallery image (reuse cover image as a second photo for demo purposes)
            restaurant.images.append(RestaurantImage(image_url=r["cover_image"]))

            # Attach tables
            for capacity, count in r["tables"]:
                for _ in range(count):
                    restaurant.tables.append(
                        RestaurantTable(table_type="Indoor", capacity=capacity)
                    )

            db.session.add(restaurant)

        for c in COUPONS:
            if not Coupon.query.filter_by(code=c["code"]).first():
                db.session.add(Coupon(**c))

        db.session.commit()
        print(f"Seeded {len(RESTAURANTS)} restaurants and {len(COUPONS)} coupons successfully.")


if __name__ == "__main__":
    seed()
