"""
Third seed batch — adds another set of Pune restaurants + coupons on top of
seed_data.py and seed_more_data.py, without duplicating existing entries.

Usage:
    python database/seed_more_data_2.py
"""

import os
import sys
from datetime import time, date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from models import Restaurant, RestaurantImage, Amenity, RestaurantTable, Coupon

app = create_app()

BATCH_3_RESTAURANTS = [
    {
        "name": "Thai Orchid",
        "description": "Fragrant Thai curries, tom yum, and stir-fries in a serene setting.",
        "address": "North Main Road, Koregaon Park",
        "area": "Koregaon Park",
        "cuisine_type": "Thai",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1800,
        "rating": 4.5,
        "total_reviews": 213,
        "opening_time": time(12, 0),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1559847844-5315695dadae",
        "is_instant_booking": True,
        "amenities": ["Couple Friendly", "Outdoor Seating", "Parking"],
        "tables": [(2, 8), (4, 6)],
    },
    {
        "name": "La Piazza",
        "description": "Neapolitan-style pizzas baked in a wood-fired oven, family recipes.",
        "address": "Bund Garden Road, Camp",
        "area": "Camp",
        "cuisine_type": "Italian",
        "food_type": "Veg",
        "avg_budget_for_two": 1500,
        "rating": 4.4,
        "total_reviews": 302,
        "opening_time": time(12, 0),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1513104890138-7c749659a591",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Parking", "Offers Available"],
        "tables": [(2, 8), (4, 8), (6, 2)],
    },
    {
        "name": "Biryani Junction",
        "description": "Dum-cooked Hyderabadi and Lucknowi biryanis, a Pune favorite.",
        "address": "JM Road, Shivajinagar",
        "area": "JM Road",
        "cuisine_type": "Hyderabadi",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 900,
        "rating": 4.6,
        "total_reviews": 845,
        "opening_time": time(11, 0),
        "closing_time": time(23, 30),
        "cover_image": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Offers Available", "Instant Booking"],
        "tables": [(2, 10), (4, 12), (6, 6)],
    },
    {
        "name": "Cafe Bloom",
        "description": "Instagram-worthy floral cafe serving all-day breakfast and specialty coffee.",
        "address": "North Main Road, Koregaon Park",
        "area": "Koregaon Park",
        "cuisine_type": "Cafe",
        "food_type": "Veg",
        "avg_budget_for_two": 1000,
        "rating": 4.5,
        "total_reviews": 456,
        "opening_time": time(8, 0),
        "closing_time": time(22, 0),
        "cover_image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        "is_instant_booking": True,
        "amenities": ["Outdoor Seating", "Couple Friendly", "Pet Friendly"],
        "tables": [(2, 10), (4, 6)],
    },
    {
        "name": "Punjab Da Pind",
        "description": "Rustic dhaba-style Punjabi food served on charpais under fairy lights.",
        "address": "Sinhagad Road, Vadgaon",
        "area": "Sinhagad Road",
        "cuisine_type": "North Indian",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1100,
        "rating": 4.3,
        "total_reviews": 267,
        "opening_time": time(12, 0),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1601050690597-df0568f70950",
        "is_instant_booking": True,
        "amenities": ["Outdoor Seating", "Family Friendly", "Parking", "Live Music"],
        "tables": [(4, 10), (6, 6), (8, 4)],
    },
    {
        "name": "Mediterraneo",
        "description": "Hummus, falafel, and grilled meats — a slice of the Mediterranean coast.",
        "address": "Ganeshkhind Road, University Road",
        "area": "University Road",
        "cuisine_type": "Mediterranean",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 1700,
        "rating": 4.4,
        "total_reviews": 178,
        "opening_time": time(12, 30),
        "closing_time": time(22, 30),
        "cover_image": "https://images.unsplash.com/photo-1544025162-d76694265947",
        "is_instant_booking": False,
        "amenities": ["Couple Friendly", "Outdoor Seating"],
        "tables": [(2, 6), (4, 6)],
    },
    {
        "name": "Momo Point",
        "description": "Steamed, fried, and tandoori momos with a dozen dip varieties.",
        "address": "FC Road, Shivajinagar",
        "area": "FC Road",
        "cuisine_type": "Tibetan",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 500,
        "rating": 4.5,
        "total_reviews": 389,
        "opening_time": time(11, 0),
        "closing_time": time(22, 0),
        "cover_image": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Offers Available", "Instant Booking"],
        "tables": [(2, 12), (4, 8)],
    },
    {
        "name": "The Wine Cellar",
        "description": "Intimate wine bar with a curated small-plates menu and live jazz.",
        "address": "Boat Club Road, Model Colony",
        "area": "Model Colony",
        "cuisine_type": "Continental",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 2800,
        "rating": 4.7,
        "total_reviews": 156,
        "opening_time": time(18, 0),
        "closing_time": time(0, 30),
        "cover_image": "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
        "is_instant_booking": False,
        "amenities": ["Couple Friendly", "Live Music", "Parking"],
        "tables": [(2, 8), (4, 4)],
    },
    {
        "name": "Udupi Sagar",
        "description": "Classic Udupi vegetarian meals — dosas, vadas, and filter kaapi.",
        "address": "Karve Road, Kothrud",
        "area": "Kothrud",
        "cuisine_type": "South Indian",
        "food_type": "Pure Veg",
        "avg_budget_for_two": 450,
        "rating": 4.4,
        "total_reviews": 623,
        "opening_time": time(7, 0),
        "closing_time": time(21, 30),
        "cover_image": "https://images.unsplash.com/photo-1630383249896-424e482df921",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Wheelchair Accessible", "Offers Available"],
        "tables": [(2, 14), (4, 10)],
    },
    {
        "name": "Grill & Chill",
        "description": "Casual grill-your-own Korean BBQ experience with unlimited sides.",
        "address": "Baner-Pashan Link Road, Baner",
        "area": "Baner",
        "cuisine_type": "Korean",
        "food_type": "Non-Veg",
        "avg_budget_for_two": 2100,
        "rating": 4.5,
        "total_reviews": 198,
        "opening_time": time(12, 0),
        "closing_time": time(23, 0),
        "cover_image": "https://images.unsplash.com/photo-1544025162-d76694265947",
        "is_instant_booking": True,
        "amenities": ["Family Friendly", "Parking", "Buffet"],
        "tables": [(2, 8), (4, 8), (6, 4)],
    },
    {
        "name": "Sweet Basil Thai Kitchen",
        "description": "Street-style Thai food — pad thai, som tam, and mango sticky rice.",
        "address": "Wanowrie Road, Wanowrie",
        "area": "Wanowrie",
        "cuisine_type": "Thai",
        "food_type": "Veg",
        "avg_budget_for_two": 1200,
        "rating": 4.2,
        "total_reviews": 134,
        "opening_time": time(12, 0),
        "closing_time": time(22, 30),
        "cover_image": "https://images.unsplash.com/photo-1559314809-0d155014e29e",
        "is_instant_booking": True,
        "amenities": ["Outdoor Seating", "Offers Available"],
        "tables": [(2, 6), (4, 6)],
    },
    {
        "name": "Farmhouse Kitchen",
        "description": "Rustic farm-to-table dining with produce from their own organic farm.",
        "address": "NIBM Road, Kondhwa",
        "area": "NIBM Road",
        "cuisine_type": "Continental",
        "food_type": "Veg",
        "avg_budget_for_two": 1600,
        "rating": 4.6,
        "total_reviews": 209,
        "opening_time": time(11, 0),
        "closing_time": time(22, 0),
        "cover_image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        "is_instant_booking": False,
        "amenities": ["Outdoor Seating", "Family Friendly", "Pet Friendly", "Parking"],
        "tables": [(2, 8), (4, 10), (6, 4)],
    },
]

MORE_COUPONS = [
    {
        "code": "FIRSTBITE100",
        "description": "Flat ₹100 off on your first booking of the month",
        "discount_type": "Flat",
        "discount_value": 100,
        "min_booking_amount": 800,
        "valid_from": date(2026, 1, 1),
        "valid_until": date(2026, 12, 31),
        "usage_limit": 2000,
    },
    {
        "code": "GROUPFEAST30",
        "description": "30% off for bookings of 6 or more people, up to ₹500",
        "discount_type": "Percentage",
        "discount_value": 30,
        "min_booking_amount": 1500,
        "max_discount": 500,
        "valid_from": date(2026, 1, 1),
        "valid_until": date(2026, 12, 31),
        "usage_limit": 300,
    },
    {
        "code": "LATENIGHT15",
        "description": "15% off on bookings after 9 PM",
        "discount_type": "Percentage",
        "discount_value": 15,
        "min_booking_amount": 400,
        "max_discount": 200,
        "valid_from": date(2026, 1, 1),
        "valid_until": date(2026, 12, 31),
        "usage_limit": 1000,
    },
]


def seed_batch_3():
    with app.app_context():
        amenity_lookup = {a.name: a for a in Amenity.query.all()}
        existing_names = {r.name for r in Restaurant.query.all()}

        added = 0
        for r in BATCH_3_RESTAURANTS:
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
                rating=0,
                total_reviews=0,
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

        coupons_added = 0
        for c in MORE_COUPONS:
            if not Coupon.query.filter_by(code=c["code"]).first():
                db.session.add(Coupon(**c))
                coupons_added += 1

        db.session.commit()
        print(f"Added {added} new restaurants (skipped {len(BATCH_3_RESTAURANTS) - added} duplicates).")
        print(f"Added {coupons_added} new coupons (skipped {len(MORE_COUPONS) - coupons_added} duplicates).")


if __name__ == "__main__":
    seed_batch_3()
