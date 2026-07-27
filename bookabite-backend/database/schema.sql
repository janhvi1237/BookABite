-- ============================================================
-- BookABite Database Schema (Microsoft SQL Server)
-- ============================================================

CREATE DATABASE BookABiteDB;
GO
USE BookABiteDB;
GO

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    phone NVARCHAR(15) NULL,
    password_hash NVARCHAR(255) NOT NULL,
    profile_image NVARCHAR(255) NULL,
    is_admin BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE Restaurants (
    restaurant_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NULL,
    address NVARCHAR(255) NOT NULL,
    area NVARCHAR(100) NULL,           -- e.g. Koregaon Park, Baner
    city NVARCHAR(100) DEFAULT 'Pune',
    latitude DECIMAL(9,6) NULL,
    longitude DECIMAL(9,6) NULL,
    cuisine_type NVARCHAR(100) NULL,   -- primary cuisine (denormalized for quick search)
    food_type NVARCHAR(20) NULL,       -- Veg / Non-Veg / Pure Veg / Jain / Vegan
    avg_budget_for_two DECIMAL(10,2) NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    opening_time TIME NULL,
    closing_time TIME NULL,
    cover_image NVARCHAR(255) NULL,
    is_instant_booking BIT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Restaurant photo gallery
CREATE TABLE RestaurantImages (
    image_id INT IDENTITY(1,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    image_url NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_RestaurantImages_Restaurant FOREIGN KEY (restaurant_id)
        REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
);
GO

-- Master list of amenities/filters (Outdoor Seating, Rooftop, Parking, etc.)
CREATE TABLE Amenities (
    amenity_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE   -- e.g. 'Rooftop', 'Pet Friendly', 'Live Music'
);
GO

-- Many-to-many: Restaurant <-> Amenities
CREATE TABLE RestaurantAmenities (
    restaurant_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (restaurant_id, amenity_id),
    CONSTRAINT FK_RA_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    CONSTRAINT FK_RA_Amenity FOREIGN KEY (amenity_id) REFERENCES Amenities(amenity_id) ON DELETE CASCADE
);
GO

-- Restaurant tables/capacity (for availability checks)
CREATE TABLE RestaurantTables (
    table_id INT IDENTITY(1,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    table_type NVARCHAR(50) NULL,     -- e.g. 'Indoor', 'Rooftop', 'Outdoor'
    capacity INT NOT NULL,
    CONSTRAINT FK_Tables_Restaurant FOREIGN KEY (restaurant_id)
        REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
);
GO

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE Bookings (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    table_id INT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    party_size INT NOT NULL,
    status NVARCHAR(20) DEFAULT 'Pending',   -- Pending, Confirmed, Cancelled, Completed
    special_request NVARCHAR(500) NULL,
    qr_code NVARCHAR(255) NULL,              -- QR booking confirmation
    scratch_card_used BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Booking_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Booking_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
    CONSTRAINT FK_Booking_Table FOREIGN KEY (table_id) REFERENCES RestaurantTables(table_id)
);
GO

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE Payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    razorpay_order_id NVARCHAR(100) NULL,
    razorpay_payment_id NVARCHAR(100) NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency NVARCHAR(10) DEFAULT 'INR',
    status NVARCHAR(20) DEFAULT 'Pending',  -- Pending, Success, Failed, Refunded
    payment_method NVARCHAR(50) NULL,
    invoice_number NVARCHAR(50) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Payment_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);
GO

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE Reviews (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    booking_id INT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(1000) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Review_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Review_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
    CONSTRAINT FK_Review_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);
GO

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE Coupons (
    coupon_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL,
    discount_type NVARCHAR(20) NOT NULL,   -- 'Percentage' or 'Flat'
    discount_value DECIMAL(10,2) NOT NULL,
    min_booking_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2) NULL,
    valid_from DATE NULL,
    valid_until DATE NULL,
    usage_limit INT NULL,
    is_active BIT DEFAULT 1
);
GO

-- Scratch cards awarded after booking
CREATE TABLE ScratchCards (
    scratch_card_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    reward_type NVARCHAR(50) NULL,     -- 'Discount Coupon', 'Cashback', 'No Reward'
    reward_value DECIMAL(10,2) NULL,
    is_revealed BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Scratch_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Scratch_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);
GO

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE Favorites (
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, restaurant_id),
    CONSTRAINT FK_Fav_User FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_Fav_Restaurant FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
);
GO

-- ============================================================
-- SEED: base amenities list (matches filters in brief)
-- ============================================================
INSERT INTO Amenities (name) VALUES
('Outdoor Seating'), ('Rooftop'), ('Family Friendly'), ('Couple Friendly'),
('Pet Friendly'), ('Parking'), ('Live Music'), ('Buffet'),
('Wheelchair Accessible'), ('Instant Booking'), ('Offers Available');
GO
