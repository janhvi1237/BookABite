"""
Safe, non-destructive migration and menu seeder for BookABiteDB.
Adds MenuItems table, owner_id to Restaurants, role to Users,
and seeds rich menu items and an owner demo account.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db, bcrypt
from sqlalchemy import text, inspect
from models import User, Restaurant, MenuItem, Review

app = create_app()

MENU_DATA_TEMPLATES = {
    "North Indian": [
        {
            "name": "Smoked Butter Chicken",
            "category": "Main Course",
            "price": 480.0,
            "description": "Tender tandoor-roasted chicken in a rich, velvety tomato and fenugreek gravy, gently wood-smoked.",
            "is_veg": False,
            "spice_level": "Medium",
            "ingredients": "Farm Chicken, Cashew Puree, San Marzano Tomatoes, Kasuri Methi, Spices",
            "dietary_info": "Gluten-Free",
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Dahi Ke Kebab",
            "category": "Starters",
            "price": 360.0,
            "description": "Crispy golden croquettes filled with hung spiced yoghurt, pomegranate pearls, and fresh mint.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Hung Curd, Roasted Gram Flour, Pomegranate, Green Cardamom, Mint Chutney",
            "dietary_info": "Vegetarian",
            "rating": 4.8,
            "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Dal Bukhara",
            "category": "Main Course",
            "price": 420.0,
            "description": "Black lentils slow-simmered over charcoal embers for 18 hours with churned white butter.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Urad Lentils, Churned Butter, Fresh Cream, Ginger-Garlic Confit",
            "dietary_info": "Vegetarian, Gluten-Free",
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Truffle Garlic Naan",
            "category": "Starters",
            "price": 180.0,
            "description": "Artisan clay-oven flatbread brushed with black truffle butter, charred garlic, and cilantro.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Refined Flour, Truffle Oil, Roasted Garlic, Farm Butter",
            "dietary_info": "Vegetarian",
            "rating": 4.7,
            "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Shahi Saffron Phirni",
            "category": "Desserts",
            "price": 280.0,
            "description": "Creamy ground rice pudding infused with Kashmiri saffron, crushed pistachios, and silver leaf in clay pots.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Basmati Rice, Whole Milk, Kashmiri Kesar, Iranian Pistachio",
            "dietary_info": "Vegetarian, Gluten-Free",
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Smoked Rooh Afza Spritz",
            "category": "Beverages",
            "price": 240.0,
            "description": "Nostalgic Damascus rose syrup with chilled sparkling soda, basil seeds, and a mist of botanical citrus.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Wild Rose Cordial, Club Soda, Sabja Seeds, Meyer Lemon",
            "dietary_info": "Vegan, Gluten-Free",
            "rating": 4.6,
            "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80",
        },
    ],
    "Italian": [
        {
            "name": "Truffle Burrata & Heirloom Pizza",
            "category": "Main Course",
            "price": 680.0,
            "description": "San Marzano marinara, 48-hour fermented sourdough, fresh Pugliese burrata, and black summer truffle oil.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Sourdough Crust, Pugliese Burrata, Heirloom Tomatoes, Basil Oil, Truffle",
            "dietary_info": "Vegetarian",
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Handmade Wild Mushroom Pappardelle",
            "category": "Main Course",
            "price": 590.0,
            "description": "Ribbon egg pasta tossed with porcini and cremini mushrooms, 24-month Parmigiano-Reggiano, and thyme.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Egg Dough, Porcini Mushrooms, Butter Emulsion, Parmigiano Reggiano",
            "dietary_info": "Vegetarian",
            "rating": 4.8,
            "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281081?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Wood-Fired Bruschetta Trio",
            "category": "Starters",
            "price": 340.0,
            "description": "Charred sourdough topped with roasted bell peppers, balsamic tomato concassé, and whipped ricotta.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Rustic Ciabatta, Whipped Ricotta, Modena Balsamic Glaze, Sweet Basil",
            "dietary_info": "Vegetarian",
            "rating": 4.7,
            "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Classic Venetian Tiramisù",
            "category": "Desserts",
            "price": 380.0,
            "description": "Savoiardi ladyfingers bathed in single-origin espresso, whipped mascarpone cream, and Dutch cocoa powder.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Italian Mascarpone, Ladyfingers, Dark Roast Espresso, Valrhona Cocoa",
            "dietary_info": "Vegetarian",
            "rating": 5.0,
            "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Sicilian Blood Orange Tonic",
            "category": "Beverages",
            "price": 260.0,
            "description": "Cold-pressed Tarocco blood orange, rosemary sprig, elderflower cordial, and crisp sparkling mineral tonic.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Blood Orange, Elderflower, Rosemary, Sparkling Tonic",
            "dietary_info": "Vegan, Gluten-Free",
            "rating": 4.8,
            "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
        },
    ],
    "Default": [
        {
            "name": "Crispy Avocado & Edamame Crostini",
            "category": "Starters",
            "price": 390.0,
            "description": "Smashed Hass avocado, yuzu dressing, furikake seasoning, and shaved radishes on seeded brioche.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Hass Avocado, Edamame, Yuzu Citrus, Brioche Toast, Radish",
            "dietary_info": "Vegan",
            "rating": 4.7,
            "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Signature Pan-Seared Ravioli",
            "category": "Main Course",
            "price": 540.0,
            "description": "Hand-folded pasta stuffed with ricotta and roasted squash, served with hazelnut brown butter.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Ricotta, Butternut Squash, Hazelnut Butter, Sage",
            "dietary_info": "Vegetarian",
            "rating": 4.8,
            "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Artisan Dark Chocolate Fondant",
            "category": "Desserts",
            "price": 360.0,
            "description": "Molten Belgian 70% chocolate center served warm with Madagascan vanilla bean gelato.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Belgian Chocolate, Vanilla Bean Gelato, Sea Salt Flakes",
            "dietary_info": "Vegetarian",
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
        },
        {
            "name": "Cold Brew Espresso Tonic",
            "category": "Beverages",
            "price": 220.0,
            "description": "16-hour slow-steeped Arabica cold brew poured over tonic with a twist of charred grapefruit.",
            "is_veg": True,
            "spice_level": "Mild",
            "ingredients": "Single-Origin Cold Brew, Indian Tonic Water, Pink Grapefruit",
            "dietary_info": "Vegan, Gluten-Free",
            "rating": 4.6,
            "image_url": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80",
        },
    ],
}


def run_migration():
    with app.app_context():
        inspector = inspect(db.engine)
        table_names = inspector.get_table_names()
        print("Existing tables:", table_names)

        # 1. Create MenuItems table if not present
        if "MenuItems" not in table_names:
            print("Creating MenuItems table...")
            create_menu_sql = """
            CREATE TABLE MenuItems (
                item_id INT IDENTITY(1,1) PRIMARY KEY,
                restaurant_id INT NOT NULL,
                name NVARCHAR(150) NOT NULL,
                description NVARCHAR(MAX) NULL,
                price DECIMAL(10,2) NOT NULL,
                category NVARCHAR(50) NOT NULL,
                image_url NVARCHAR(500) NULL,
                is_veg BIT DEFAULT 1,
                is_available BIT DEFAULT 1,
                spice_level NVARCHAR(20) DEFAULT 'Medium',
                ingredients NVARCHAR(500) NULL,
                dietary_info NVARCHAR(200) NULL,
                rating DECIMAL(2,1) DEFAULT 4.5,
                popularity INT DEFAULT 0,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE(),
                CONSTRAINT FK_MenuItems_Restaurant FOREIGN KEY (restaurant_id)
                    REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
            );
            """
            db.session.execute(text(create_menu_sql))
            db.session.commit()
            print("MenuItems table created!")
        else:
            print("MenuItems table already exists.")

        # 2. Add owner_id to Restaurants if not present
        restaurant_cols = [c["name"] for c in inspector.get_columns("Restaurants")]
        if "owner_id" not in restaurant_cols:
            print("Adding owner_id column to Restaurants...")
            db.session.execute(text("ALTER TABLE Restaurants ADD owner_id INT NULL;"))
            db.session.commit()
            print("Added owner_id column.")
        else:
            print("owner_id column exists on Restaurants.")

        # 3. Add role to Users if not present
        user_cols = [c["name"] for c in inspector.get_columns("Users")]
        if "role" not in user_cols:
            print("Adding role column to Users...")
            db.session.execute(text("ALTER TABLE Users ADD role NVARCHAR(20) DEFAULT 'customer';"))
            db.session.commit()
            print("Added role column to Users.")
        else:
            print("role column exists on Users.")

        # 4. Seed or find demo owner
        owner = User.query.filter_by(email="owner@bookabite.com").first()
        if not owner:
            print("Creating demo owner user...")
            pwd_hash = bcrypt.generate_password_hash("Password@123").decode("utf-8")
            owner = User(
                full_name="Aarav Mehta",
                email="owner@bookabite.com",
                phone="9876543210",
                password_hash=pwd_hash,
                role="owner",
                is_admin=False,
            )
            db.session.add(owner)
            db.session.commit()
            print("Created demo owner user: owner@bookabite.com / Password@123")
        else:
            owner.role = "owner"
            db.session.commit()

        # 5. Link first 2 restaurants to this owner
        restaurants = Restaurant.query.all()
        for idx, rest in enumerate(restaurants):
            if idx < 2 and not rest.owner_id:
                rest.owner_id = owner.user_id
        db.session.commit()

        # 6. Seed menu items for each restaurant if empty
        existing_menu_count = MenuItem.query.count()
        print(f"Current menu item count: {existing_menu_count}")
        if existing_menu_count < 10:
            print("Seeding delicious dishes for all restaurants...")
            for rest in restaurants:
                cuisine = rest.cuisine_type or "Default"
                dishes = MENU_DATA_TEMPLATES.get(cuisine, MENU_DATA_TEMPLATES["Default"])
                # Also mix in some beverages and starters
                extra_dishes = MENU_DATA_TEMPLATES["North Indian"] if cuisine != "North Indian" else MENU_DATA_TEMPLATES["Italian"]
                all_to_add = dishes + extra_dishes[:2]

                for item in all_to_add:
                    # check duplicate by name
                    exists = MenuItem.query.filter_by(restaurant_id=rest.restaurant_id, name=item["name"]).first()
                    if not exists:
                        menu_item = MenuItem(
                            restaurant_id=rest.restaurant_id,
                            name=item["name"],
                            category=item["category"],
                            price=item["price"],
                            description=item["description"],
                            is_veg=item["is_veg"],
                            spice_level=item["spice_level"],
                            ingredients=item["ingredients"],
                            dietary_info=item["dietary_info"],
                            rating=item["rating"],
                            popularity=item.get("popularity", 10),
                            image_url=item["image_url"],
                        )
                        db.session.add(menu_item)
            db.session.commit()
            print(f"Seeded menu items successfully! New count: {MenuItem.query.count()}")

        # 7. Seed sample reviews if empty
        if Review.query.count() == 0 and len(restaurants) > 0:
            print("Seeding sample reviews...")
            first_user = User.query.first()
            if first_user:
                sample_reviews = [
                    (5, "Absolutely wonderful experience! The smoked butter chicken and ambiance were sublime."),
                    (4, "Great food and prompt service. The table booking worked flawlessly."),
                    (5, "One of the best dining places in Pune. Will definitely reserve again!"),
                ]
                for r_idx, rest in enumerate(restaurants[:4]):
                    rating, comment = sample_reviews[r_idx % len(sample_reviews)]
                    rev = Review(
                        user_id=first_user.user_id,
                        restaurant_id=rest.restaurant_id,
                        rating=rating,
                        comment=comment,
                    )
                    db.session.add(rev)
                db.session.commit()
                print("Seeded reviews!")

        print("Migration and seeding finished successfully.")


if __name__ == "__main__":
    run_migration()
