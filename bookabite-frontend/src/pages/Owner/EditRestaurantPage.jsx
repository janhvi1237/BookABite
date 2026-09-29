import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineSave,
  HiOutlinePhotograph,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiPlus,
  HiTrash,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchRestaurantById, updateRestaurant, fetchOwnerRestaurants } from '../../api/restaurants';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './OwnerPages.css';

const CUISINE_OPTIONS = ['North Indian', 'Italian', 'Multi-Cuisine', 'Indian Fusion', 'Café', 'Continental', 'Desserts & Bakes', 'Asian & Chinese'];
const ALL_AMENITIES = ['Outdoor Seating', 'Rooftop', 'Live Music', 'Couple Friendly', 'Pet Friendly', 'Parking', 'Wheelchair Accessible', 'Instant Booking'];

export default function EditRestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ownerVenues, setOwnerVenues] = useState([]);
  const [selectedId, setSelectedId] = useState(id || '');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineType, setCuisineType] = useState('North Indian');
  const [foodType, setFoodType] = useState('Veg & Non-Veg');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411001');
  const [openingTime, setOpeningTime] = useState('11:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [avgBudgetForTwo, setAvgBudgetForTwo] = useState('1500');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [photoUrls, setPhotoUrls] = useState([]);
  const [newPhotoInput, setNewPhotoInput] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (user?.id) {
          const venues = await fetchOwnerRestaurants(user.id);
          setOwnerVenues(venues);
          const targetId = id || (venues.length > 0 ? venues[0].id : null);
          if (targetId) {
            setSelectedId(targetId);
            const rest = await fetchRestaurantById(targetId);
            populateForm(rest);
          }
        } else if (id) {
          const rest = await fetchRestaurantById(id);
          populateForm(rest);
        }
      } catch (err) {
        console.error('Failed to load restaurant for edit:', err);
        showToast('Unable to load restaurant details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user?.id]);

  function populateForm(rest) {
    if (!rest) return;
    setName(rest.name || '');
    setDescription(rest.description || '');
    setCuisineType(rest.cuisine || 'Multi-Cuisine');
    setFoodType(rest.foodType || 'Veg & Non-Veg');
    setAddress(rest.address || '');
    setArea(rest.area || '');
    setCity(rest.city || 'Pune');
    setOpeningTime(rest.openingTime || '11:00');
    setClosingTime(rest.closingTime || '23:00');
    setAvgBudgetForTwo(String(rest.priceForTwo || 1200));
    setSelectedAmenities(rest.amenities || []);
    setCoverImage(rest.image || '');
    setPhotoUrls(rest.images || []);
  }

  async function handleSwitchRestaurant(e) {
    const newId = e.target.value;
    setSelectedId(newId);
    navigate(`/owner/restaurants/${newId}/edit`);
    try {
      setLoading(true);
      const rest = await fetchRestaurantById(newId);
      populateForm(rest);
    } catch (err) {
      showToast('Could not load chosen venue.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function toggleAmenity(item) {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  }

  function handleAddPhoto() {
    if (!newPhotoInput.trim()) return;
    setPhotoUrls([...photoUrls, newPhotoInput.trim()]);
    setNewPhotoInput('');
  }

  function handleRemovePhoto(index) {
    setPhotoUrls(photoUrls.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      showToast('Restaurant Name and Address are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        description,
        cuisine_type: cuisineType,
        food_type: foodType,
        address,
        area,
        city,
        pincode,
        opening_time: openingTime,
        closing_time: closingTime,
        avg_budget_for_two: Number(avgBudgetForTwo) || 1200,
        amenities: selectedAmenities,
        cover_image: coverImage,
        images: photoUrls.length > 0 ? photoUrls : [coverImage],
      };

      await updateRestaurant(selectedId, payload);
      triggerReaction('celebrating', 'Restaurant profile updated with perfection!');
      showToast('Restaurant details updated successfully!', 'success');
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update venue details. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader message="Loading restaurant profile..." />;

  return (
    <div className="bab-wizard-page">
      <div className="bab-wizard-container">
        {/* Navigation & Selection bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <Link to="/owner/dashboard" className="bab-link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiArrowLeft size={16} /> Back to Dashboard
          </Link>

          {ownerVenues.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Editing Venue:</label>
              <select
                value={selectedId}
                onChange={handleSwitchRestaurant}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'white',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              >
                {ownerVenues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.area})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bab-wizard-card">
            <div className="bab-wizard-card__header">
              <h2>Edit Restaurant Details</h2>
              <p>Keep your restaurant profile fresh and appealing for diners reserving tables.</p>
            </div>

            {/* Basic Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="bab-form-label">Restaurant Name *</label>
                <input
                  type="text"
                  className="bab-form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Saffron Lounge"
                  required
                />
              </div>

              <div>
                <label className="bab-form-label">Short Description</label>
                <textarea
                  className="bab-form-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your dining atmosphere, specialties, and experience..."
                />
              </div>

              <div className="bab-wizard-form-grid">
                <div>
                  <label className="bab-form-label">Primary Cuisine</label>
                  <select
                    className="bab-form-select"
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                  >
                    {CUISINE_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="bab-form-label">Food Classification</label>
                  <select
                    className="bab-form-select"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                  >
                    <option value="Veg & Non-Veg">Pure Veg & Non-Veg</option>
                    <option value="Pure Veg">Pure Veg Only</option>
                    <option value="Non-Veg">Non-Veg Specialty</option>
                  </select>
                </div>

                <div>
                  <label className="bab-form-label">Opening Time</label>
                  <input
                    type="time"
                    className="bab-form-input"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="bab-form-label">Closing Time</label>
                  <input
                    type="time"
                    className="bab-form-input"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="bab-form-label">Avg. Cost for Two (₹)</label>
                  <input
                    type="number"
                    className="bab-form-input"
                    value={avgBudgetForTwo}
                    onChange={(e) => setAvgBudgetForTwo(e.target.value)}
                    min="100"
                    step="50"
                  />
                </div>
              </div>

              {/* Location Details */}
              <div style={{ marginTop: 10 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: 12 }}>
                  Location & Address
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="bab-form-label">Street Address *</label>
                    <input
                      type="text"
                      className="bab-form-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Floor, building, street..."
                      required
                    />
                  </div>

                  <div className="bab-wizard-form-grid">
                    <div>
                      <label className="bab-form-label">Area / Locality</label>
                      <input
                        type="text"
                        className="bab-form-input"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Koregaon Park"
                      />
                    </div>
                    <div>
                      <label className="bab-form-label">City</label>
                      <input
                        type="text"
                        className="bab-form-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="bab-form-label">Postal Code</label>
                      <input
                        type="text"
                        className="bab-form-input"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div style={{ marginTop: 10 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: 10 }}>
                  Features & Amenities
                </h4>
                <div className="bab-chips-grid">
                  {ALL_AMENITIES.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={`bab-chip-btn ${selectedAmenities.includes(item) ? 'bab-chip-btn--active' : ''}`}
                      onClick={() => toggleAmenity(item)}
                    >
                      {selectedAmenities.includes(item) ? '✓ ' : '+ '} {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div style={{ marginTop: 10 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: 12 }}>
                  Photos & Showcase
                </h4>
                <div>
                  <label className="bab-form-label">Cover Image URL</label>
                  <input
                    type="url"
                    className="bab-form-input"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                  />
                  {coverImage && (
                    <div style={{ marginTop: 8, height: 160, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img src={coverImage} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <label className="bab-form-label">Additional Gallery Photos</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      type="url"
                      className="bab-form-input"
                      value={newPhotoInput}
                      onChange={(e) => setNewPhotoInput(e.target.value)}
                      placeholder="Paste gallery image URL..."
                    />
                    <button
                      type="button"
                      className="bab-btn bab-btn--secondary"
                      onClick={handleAddPhoto}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <HiPlus size={18} /> Add
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                    {photoUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', height: 90, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                        <img src={url} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(0,0,0,0.65)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <HiTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit / Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
                <Link to="/owner/dashboard" className="bab-btn bab-btn--outline">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bab-btn bab-btn--secondary"
                  disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <HiOutlineSave size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
