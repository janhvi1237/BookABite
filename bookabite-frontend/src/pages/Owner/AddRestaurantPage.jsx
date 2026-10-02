import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiCheck,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlinePhotograph,
  HiOutlineBookOpen,
  HiArrowLeft,
  HiArrowRight,
  HiPlus,
  HiTrash,
} from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { createRestaurant } from '../../api/restaurants';
import { addMenuItem } from '../../api/menu';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './OwnerPages.css';

const RESTAURANT_TYPES = ['Restaurant', 'Café & Bakery', 'Boutique Bistro', 'Cloud Kitchen', 'Bar & Grill'];
const CUISINE_OPTIONS = ['North Indian', 'Italian', 'Multi-Cuisine', 'Indian Fusion', 'Café', 'Continental', 'Desserts & Bakes', 'Asian & Chinese'];
const ALL_AMENITIES = ['Outdoor Seating', 'Rooftop', 'Live Music', 'Couple Friendly', 'Pet Friendly', 'Parking', 'Wheelchair Accessible', 'Instant Booking'];

export default function AddRestaurantPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // STEP 1: Business Information
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [restaurantType, setRestaurantType] = useState('Restaurant');

  // STEP 2: Location
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Koregaon Park');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411001');

  // STEP 3: Business Details
  const [cuisineType, setCuisineType] = useState('North Indian');
  const [foodType, setFoodType] = useState('Veg & Non-Veg');
  const [openingTime, setOpeningTime] = useState('11:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [avgBudgetForTwo, setAvgBudgetForTwo] = useState('1500');
  const [selectedAmenities, setSelectedAmenities] = useState(['Outdoor Seating', 'Parking']);

  // STEP 4: Images
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80');
  const [photoUrls, setPhotoUrls] = useState([
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop&q=80',
  ]);

  // STEP 5: Initial Menu items
  const [menuItems, setMenuItems] = useState([
    { name: 'Chef Special Platter', category: 'Starters', price: 420, is_veg: true, description: 'Handcrafted appetizer selection' },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Starters');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemVeg, setNewItemVeg] = useState(true);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddDish = () => {
    if (!newItemName || !newItemPrice) {
      showToast("Please enter dish name and price", "info");
      return;
    }
    setMenuItems((prev) => [
      ...prev,
      {
        name: newItemName,
        category: newItemCategory,
        price: Number(newItemPrice),
        is_veg: newItemVeg,
        description: 'House specialty made fresh to order.',
      },
    ]);
    setNewItemName('');
    setNewItemPrice('');
    triggerReaction('happy', "Added dish to your initial menu!", 2000);
  };

  const handleRemoveDish = (index) => {
    setMenuItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      showToast("Please enter your restaurant name", "info");
      return;
    }
    if (step === 2 && (!address.trim() || !area.trim())) {
      showToast("Please provide address and neighborhood area", "info");
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  };

  const handleSubmitOnboarding = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        address,
        area,
        city,
        cuisine_type: cuisineType,
        food_type: foodType,
        avg_budget_for_two: Number(avgBudgetForTwo),
        opening_time: openingTime,
        closing_time: closingTime,
        cover_image: coverImage,
        images: photoUrls,
        amenities: selectedAmenities,
        owner_id: user?.user_id || 1,
        is_instant_booking: true,
      };

      const newRest = await createRestaurant(payload);

      // Add initial menu items if any
      if (newRest?.id && menuItems.length > 0) {
        for (const itm of menuItems) {
          await addMenuItem(newRest.id, itm).catch(() => {});
        }
      }

      triggerReaction('celebrating', `Hurrah! ${name} is officially live on BookABite!`, 5000);
      showToast(`Restaurant profile created successfully!`, 'success');
      navigate('/owner/dashboard');
    } catch (err) {
      console.error("Failed to create restaurant:", err);
      showToast(err.message || "Failed to create restaurant profile.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bab-owner-page">
      <div className="bab-container" style={{ maxWidth: 840 }}>
        <button type="button" className="bab-back-btn" onClick={() => navigate('/owner/dashboard')}>
          <HiArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bab-onboarding-header">
          <span className="bab-section-eyebrow">PARTNER ONBOARDING</span>
          <h1 className="bab-onboarding-title">Register Your Restaurant</h1>
          <p className="bab-onboarding-subtitle">Complete these 6 simple steps to start welcoming diners.</p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bab-onboarding-progress" aria-label={`Registration progress, step ${step} of 6`}>
          {['Info', 'Location', 'Details', 'Photos', 'Menu', 'Launch'].map((lbl, idx) => (
            <div
              key={lbl}
              className="bab-onboarding-step-indicator"
              aria-current={step === idx + 1 ? 'step' : undefined}
            >
              <div className={`bab-progress-circle ${step >= idx + 1 ? 'bab-progress-circle--active' : ''}`}>
                {step > idx + 1 ? <HiCheck size={14} /> : idx + 1}
              </div>
              <span>{lbl}</span>
            </div>
          ))}
        </div>

        {/* CARD CONTAINER */}
        <div className="bab-onboarding-card">
          {/* STEP 1: BUSINESS INFO */}
          {step === 1 && (
            <div className="bab-onboarding-pane">
              <h3>Step 1: Business Information</h3>
              <div className="bab-form-group">
                <label>Restaurant / Café Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Café de Botanica"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bab-form-input"
                  required
                />
              </div>

              <div className="bab-form-group" style={{ marginTop: 16 }}>
                <label>Establishment Type</label>
                <select
                  value={restaurantType}
                  onChange={(e) => setRestaurantType(e.target.value)}
                  className="bab-form-input"
                >
                  {RESTAURANT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="bab-form-group" style={{ marginTop: 16 }}>
                <label>About the Restaurant & Concept</label>
                <textarea
                  rows="3"
                  placeholder="Describe your culinary vision, atmosphere, and specialties..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bab-form-input"
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="bab-onboarding-pane">
              <h3>Step 2: Location & Address</h3>
              <div className="bab-form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  placeholder="Shop 4, North Main Road, Near Park Plaza"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bab-form-input"
                  required
                />
              </div>

              <div className="bab-form-row" style={{ marginTop: 16 }}>
                <div className="bab-form-group">
                  <label>Neighborhood / Area *</label>
                  <input
                    type="text"
                    placeholder="e.g. Koregaon Park, Baner, FC Road"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="bab-form-input"
                    required
                  />
                </div>
                <div className="bab-form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bab-form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUSINESS DETAILS */}
          {step === 3 && (
            <div className="bab-onboarding-pane">
              <h3>Step 3: Cuisine, Hours & Amenities</h3>
              <div className="bab-form-row">
                <div className="bab-form-group">
                  <label>Primary Cuisine Type</label>
                  <select
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    className="bab-form-input"
                  >
                    {CUISINE_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="bab-form-group">
                  <label>Food Type</label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    className="bab-form-input"
                  >
                    <option value="Veg & Non-Veg">Veg & Non-Veg</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="bab-form-row" style={{ marginTop: 16 }}>
                <div className="bab-form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="bab-form-input"
                  />
                </div>
                <div className="bab-form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="bab-form-input"
                  />
                </div>
              </div>

              <div className="bab-form-group" style={{ marginTop: 16 }}>
                <label>Average Budget for Two (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={avgBudgetForTwo}
                  onChange={(e) => setAvgBudgetForTwo(e.target.value)}
                  className="bab-form-input"
                />
              </div>

              <div className="bab-form-group" style={{ marginTop: 20 }}>
                <label>Select Venue Amenities</label>
                <div className="bab-filter-pills" style={{ marginTop: 8 }}>
                  {ALL_AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`bab-filter-pill ${selectedAmenities.includes(amenity) ? 'bab-filter-pill--active' : ''}`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: IMAGES */}
          {step === 4 && (
            <div className="bab-onboarding-pane">
              <h3>Step 4: Restaurant Photos & Cover Image</h3>
              <div className="bab-form-group">
                <label>Cover Image URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="bab-form-input"
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Cover Image Preview:</label>
                <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
                  <img src={coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: INITIAL MENU */}
          {step === 5 && (
            <div className="bab-onboarding-pane">
              <h3>Step 5: Initial Menu Dishes</h3>
              <p style={{ color: 'var(--bab-text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                Add your signature dishes. You can add more dishes later in the Menu Management tab.
              </p>

              {/* DISH INPUT ROW */}
              <div className="bab-onboarding-dish-input-row">
                <input
                  type="text"
                  placeholder="Dish Name (e.g. Truffle Pizza)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bab-form-input"
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="bab-form-input"
                  style={{ maxWidth: 140 }}
                >
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="bab-form-input"
                  style={{ maxWidth: 110 }}
                />
                <button type="button" className="bab-btn bab-btn--secondary" onClick={handleAddDish}>
                  <HiPlus size={16} /> Add
                </button>
              </div>

              {/* LIST OF DISHES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                {menuItems.map((item, idx) => (
                  <div key={idx} className="bab-onboarding-dish-item">
                    <div>
                      <strong>{item.name}</strong>
                      <span className="bab-badge bab-badge--gold" style={{ marginLeft: 8 }}>{item.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <strong style={{ color: 'var(--bab-secondary)' }}>₹{item.price}</strong>
                      <button type="button" onClick={() => handleRemoveDish(idx)} style={{ background: 'none', border: 'none', color: 'var(--bab-danger)', cursor: 'pointer' }}>
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: LAUNCH */}
          {step === 6 && (
            <div className="bab-onboarding-pane">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <FoodMascot mood="celebrating" size={110} />
                <h3 style={{ fontSize: '1.8rem', color: 'var(--bab-primary)', marginTop: 16 }}>
                  Ready to Launch {name}!
                </h3>
                <p style={{ color: 'var(--bab-text-muted)', maxWidth: 480, margin: '8px auto 24px' }}>
                  Your restaurant details, images, amenities, and initial menu items are compiled and ready to be published to diners across Pune.
                </p>

                <div className="bab-onboarding-summary-review">
                  <p><strong>Venue:</strong> {name} ({restaurantType})</p>
                  <p><strong>Address:</strong> {address}, {area}, {city}</p>
                  <p><strong>Cuisine:</strong> {cuisineType} • ₹{avgBudgetForTwo} for two</p>
                  <p><strong>Initial Dishes:</strong> {menuItems.length} delicacies added</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP BUTTONS */}
          <div className="bab-step-nav-buttons">
            {step > 1 && (
              <button type="button" className="bab-btn bab-btn--outline" onClick={() => setStep((s) => s - 1)}>
                Previous
              </button>
            )}

            {step < 6 ? (
              <button
                type="button"
                className="bab-btn bab-btn--secondary"
                onClick={handleNext}
                style={{ marginLeft: 'auto' }}
              >
                Next Step <HiArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="bab-btn bab-btn--secondary"
                onClick={handleSubmitOnboarding}
                disabled={submitting}
                style={{ marginLeft: 'auto', padding: '14px 28px' }}
              >
                {submitting ? 'Publishing Restaurant...' : 'Publish Restaurant Profile 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
