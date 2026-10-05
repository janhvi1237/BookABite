-- ============================================================
-- BookABite Database Schema (Microsoft SQL Server)
-- ------------------------------------------------------------
-- COMPLETE and RE-RUNNABLE: every object is created only if it
-- does not exist yet, so running this file twice does no harm
-- and never deletes data.
--
-- Tables (13): Users, Restaurants, RestaurantImages, Amenities,
--   RestaurantAmenities, RestaurantTables, MenuItems, Bookings,
--   Payments, Reviews, Coupons, ScratchCards, Favorites
--
-- Easiest way to build everything (schema + sample data):
--     python database/setup_db.py
-- ============================================================

IF DB_ID('BookABiteDB') IS NULL
    CREATE DATABASE BookABiteDB;
GO
USE BookABiteDB;
GO

-- ============================================================
-- USERS  (roles: customer, owner, admin)
-- New owner sign-ups start with is_approved = 0 until an admin approves them.
-- ============================================================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE Users (
    user_id        INT IDENTITY(1,1) PRIMARY KEY,
    full_name      NVARCHAR(100) NOT NULL,
    email          NVARCHAR(150) NOT NULL UNIQUE,
    phone          NVARCHAR(15)  NULL,
    password_hash  NVARCHAR(255) NOT NULL,
    profile_image  NVARCHAR(255) NULL,
    is_admin       BIT NOT NULL CONSTRAINT DF_Users_is_admin DEFAULT 0,
    role           NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_role DEFAULT 'customer',
    is_approved    BIT NOT NULL CONSTRAINT DF_Users_is_approved DEFAULT 1,
    created_at     DATETIME DEFAULT GETDATE(),
    updated_at     DATETIME DEFAULT GETDATE(),
    CONSTRAINT CK_Users_role CHECK (role IN ('customer', 'owner', 'admin'))
);
GO

-- ============================================================
-- RESTAURANTS
-- ============================================================
IF OBJECT_ID('dbo.Restaurants', 'U') IS NULL
CREATE TABLE Restaurants (
    restaurant_id      INT IDENTITY(1,1) PRIMARY KEY,
    owner_id           INT NULL,                 -- the owner (Users.user_id) who manages it
    name               NVARCHAR(150) NOT NULL,
    description        NVARCHAR(MAX) NULL,
    address            NVARCHAR(255) NOT NULL,
    area               NVARCHAR(100) NULL,       -- e.g. Koregaon Park, Baner
    city               NVARCHAR(100) DEFAULT 'Pune',
    latitude           DECIMAL(9,6) NULL,
    longitude          DECIMAL(9,6) NULL,
    cuisine_type       NVARCHAR(100) NULL,       -- primary cuisine (denormalized for quick search)
    food_type          NVARCHAR(20) NULL,        -- Veg / Non-Veg / Pure Veg / Jain / Vegan
    avg_budget_for_two DECIMAL(10,2) NULL,
    rating             DECIMAL(2,1) DEFAULT 0,
    total_reviews      INT DEFAULT 0,
    opening_time       TIME NULL,
    closing_time       TIME NULL,
    cover_image        NVARCHAR(255) NULL,
    is_instant_booking BIT DEFAULT 0,
    is_active          BIT DEFAULT 1,
    dining_duration_minutes INT NOT NULL CONSTRAINT DF_Restaurants_duration DEFAULT 90,  -- how long a party keeps a table
    max_advance_days   INT NOT NULL CONSTRAINT DF_Restaurants_advance DEFAULT 30,        -- how far ahead guests may book
    created_at         DATETIME DEFAULT GETDATE(),
    updated_at         DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Restaurants_Owner FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);
GO

-- Restaurant photo gallery
IF OBJECT_ID('dbo.RestaurantImages', 'U') IS NULL
CREATE TABLE RestaurantImages (
    image_id      INT IDENTITY(1,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    image_url     NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_RestaurantImages_Restaurant FOREIGN KEY (restaurant_id)
        REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
);
GO

-- Master list of amenities/filters (Outdoor Seating, Rooftop, Parking, etc.)
IF OBJECT_ID('dbo.Amenities', 'U') IS NULL
CREATE TABLE Amenities (
    amenity_id INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- Many-to-many: Restaurant <-> Amenities
IF OBJECT_ID('dbo.RestaurantAmenities', 'U') IS NULL
CREATE TABLE RestaurantAmenities (
    restaurant_id INT NOT NULL,
    amenity_id    INT NOT NULL,
    PRIMARY KEY (restaurant_id, amenity_id),
    CONSTRAINT FK_RA_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    CONSTRAINT FK_RA_Amenity    FOREIGN KEY (amenity_id)    REFERENCES Amenities(amenity_id)    ON DELETE CASCADE
);
GO

-- Restaurant tables/capacity (for availability checks)
IF OBJECT_ID('dbo.RestaurantTables', 'U') IS NULL
CREATE TABLE RestaurantTables (
    table_id      INT IDENTITY(1,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    table_number  NVARCHAR(20) NULL,      -- label staff see: T1, T2, Window-1
    table_type    NVARCHAR(50) NULL,      -- e.g. 'Indoor', 'Rooftop', 'Outdoor'
    capacity      INT NOT NULL CONSTRAINT CK_Tables_capacity CHECK (capacity > 0),
    is_active     BIT NOT NULL CONSTRAINT DF_RestaurantTables_is_active DEFAULT 1,  -- 0 = out of service
    CONSTRAINT FK_Tables_Restaurant FOREIGN KEY (restaurant_id)
        REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
);
GO

-- ============================================================
-- MENU ITEMS  (this table was missing from the old schema.sql)
-- ============================================================
IF OBJECT_ID('dbo.MenuItems', 'U') IS NULL
CREATE TABLE MenuItems (
    item_id       INT IDENTITY(1,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name          NVARCHAR(150) NOT NULL,
    description   NVARCHAR(MAX) NULL,
    price         DECIMAL(10,2) NOT NULL CONSTRAINT CK_MenuItems_price CHECK (price >= 0),
    category      NVARCHAR(50) NOT NULL,   -- Starters, Main Course, Desserts, Beverages, Specials
    image_url     NVARCHAR(500) NULL,
    is_veg        BIT DEFAULT 1,
    is_available  BIT DEFAULT 1,
    spice_level   NVARCHAR(20) DEFAULT 'Medium',   -- Mild, Medium, Spicy
    ingredients   NVARCHAR(500) NULL,
    dietary_info  NVARCHAR(200) NULL,              -- Gluten-Free, Vegan, ...
    rating        DECIMAL(2,1) DEFAULT 4.5,
    popularity    INT DEFAULT 0,
    created_at    DATETIME DEFAULT GETDATE(),
    updated_at    DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_MenuItems_Restaurant FOREIGN KEY (restaurant_id)
        REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
);
GO

-- ============================================================
-- BOOKINGS
-- ============================================================
IF OBJECT_ID('dbo.Bookings', 'U') IS NULL
CREATE TABLE Bookings (
    booking_id        INT IDENTITY(1,1) PRIMARY KEY,
    user_id           INT NOT NULL,
    restaurant_id     INT NOT NULL,
    table_id          INT NULL,
    booking_date      DATE NOT NULL,
    booking_time      TIME NOT NULL,
    end_time          TIME NULL,                        -- booking_time + dining duration
    party_size        INT NOT NULL CONSTRAINT CK_Bookings_party CHECK (party_size > 0),
    status            NVARCHAR(20) DEFAULT 'Pending',   -- Pending, Confirmed, Cancelled, Completed
    special_request   NVARCHAR(500) NULL,
    qr_code           NVARCHAR(255) NULL,               -- QR booking confirmation
    scratch_card_used BIT DEFAULT 0,
    booking_fee       DECIMAL(10,2) NOT NULL CONSTRAINT DF_Bookings_booking_fee DEFAULT 0,
    fee_status        NVARCHAR(20) NOT NULL CONSTRAINT DF_Bookings_fee_status DEFAULT 'None',  -- None, Paid, Refunded
    created_at        DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Booking_User       FOREIGN KEY (user_id)       REFERENCES Users(user_id),
    CONSTRAINT FK_Booking_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
    CONSTRAINT FK_Booking_Table      FOREIGN KEY (table_id)      REFERENCES RestaurantTables(table_id)
);
GO

-- ============================================================
-- PAYMENTS
-- ============================================================
IF OBJECT_ID('dbo.Payments', 'U') IS NULL
CREATE TABLE Payments (
    payment_id          INT IDENTITY(1,1) PRIMARY KEY,
    booking_id          INT NOT NULL,
    razorpay_order_id   NVARCHAR(100) NULL,
    razorpay_payment_id NVARCHAR(100) NULL,
    amount              DECIMAL(10,2) NOT NULL,
    currency            NVARCHAR(10) DEFAULT 'INR',
    status              NVARCHAR(20) DEFAULT 'Pending',  -- Pending, Success, Failed, Refunded
    payment_method      NVARCHAR(50) NULL,
    invoice_number      NVARCHAR(50) NULL,
    created_at          DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Payment_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);
GO

-- ============================================================
-- REVIEWS
-- ============================================================
IF OBJECT_ID('dbo.Reviews', 'U') IS NULL
CREATE TABLE Reviews (
    review_id     INT IDENTITY(1,1) PRIMARY KEY,
    user_id       INT NOT NULL,
    restaurant_id INT NOT NULL,
    booking_id    INT NULL,
    rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       NVARCHAR(1000) NULL,
    created_at    DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Review_User       FOREIGN KEY (user_id)       REFERENCES Users(user_id),
    CONSTRAINT FK_Review_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
    CONSTRAINT FK_Review_Booking    FOREIGN KEY (booking_id)    REFERENCES Bookings(booking_id)
);
GO

-- ============================================================
-- COUPONS
-- ============================================================
IF OBJECT_ID('dbo.Coupons', 'U') IS NULL
CREATE TABLE Coupons (
    coupon_id          INT IDENTITY(1,1) PRIMARY KEY,
    code               NVARCHAR(30) NOT NULL UNIQUE,
    description        NVARCHAR(255) NULL,
    discount_type      NVARCHAR(20) NOT NULL,   -- 'Percentage' or 'Flat'
    discount_value     DECIMAL(10,2) NOT NULL,
    min_booking_amount DECIMAL(10,2) DEFAULT 0,
    max_discount       DECIMAL(10,2) NULL,
    valid_from         DATE NULL,
    valid_until        DATE NULL,
    usage_limit        INT NULL,
    is_active          BIT DEFAULT 1
);
GO

-- Scratch cards awarded after booking
IF OBJECT_ID('dbo.ScratchCards', 'U') IS NULL
CREATE TABLE ScratchCards (
    scratch_card_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT NOT NULL,
    booking_id      INT NOT NULL,
    reward_type     NVARCHAR(50) NULL,     -- 'Discount Coupon', 'Cashback', 'No Reward'
    reward_value    DECIMAL(10,2) NULL,
    is_revealed     BIT DEFAULT 0,
    created_at      DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Scratch_User    FOREIGN KEY (user_id)    REFERENCES Users(user_id),
    CONSTRAINT FK_Scratch_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);
GO

-- ============================================================
-- FAVORITES
-- ============================================================
IF OBJECT_ID('dbo.Favorites', 'U') IS NULL
CREATE TABLE Favorites (
    user_id       INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at    DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, restaurant_id),
    CONSTRAINT FK_Fav_User       FOREIGN KEY (user_id)       REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_Fav_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
);
GO

-- ============================================================
-- INDEXES (speed up the searches the website does most)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Restaurants_area_cuisine')
    CREATE INDEX IX_Restaurants_area_cuisine ON Restaurants (area, cuisine_type);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Restaurants_owner')
    CREATE INDEX IX_Restaurants_owner ON Restaurants (owner_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MenuItems_restaurant_category')
    CREATE INDEX IX_MenuItems_restaurant_category ON MenuItems (restaurant_id, category);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_restaurant_date')
    CREATE INDEX IX_Bookings_restaurant_date ON Bookings (restaurant_id, booking_date, booking_time);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_table_slot')
    CREATE INDEX IX_Bookings_table_slot ON Bookings (table_id, booking_date, booking_time);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_user')
    CREATE INDEX IX_Bookings_user ON Bookings (user_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_restaurant')
    CREATE INDEX IX_Reviews_restaurant ON Reviews (restaurant_id);
GO

-- ============================================================
-- SEED: base amenities list (only adds the ones that are missing)
-- ============================================================
INSERT INTO Amenities (name)
SELECT v.name
FROM (VALUES
    ('Outdoor Seating'), ('Rooftop'), ('Family Friendly'), ('Couple Friendly'),
    ('Pet Friendly'), ('Parking'), ('Live Music'), ('Buffet'),
    ('Wheelchair Accessible'), ('Instant Booking'), ('Offers Available')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM Amenities a WHERE a.name = v.name);
GO
