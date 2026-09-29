import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiPlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiArrowLeft,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineSparkles,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchOwnerRestaurants } from '../../api/restaurants';
import {
  fetchRestaurantMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from '../../api/menu';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './OwnerPages.css';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages', 'Breads & Rice', 'Appetizers'];
const SPICE_LEVELS = ['Mild', 'Medium', 'Hot', 'Extra Hot'];

const initialDishForm = {
  name: '',
  description: '',
  price: '',
  category: 'Main Course',
  imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  isVeg: true,
  isAvailable: true,
  spiceLevel: 'Medium',
  ingredients: '',
  dietaryInfo: 'Vegetarian',
};

export default function ManageMenuPage() {
  const { user } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestId, setSelectedRestId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialDishForm);
  const [saving, setSaving] = useState(false);

  // Load restaurants
  useEffect(() => {
    async function loadOwnerVenues() {
      try {
        setLoading(true);
        if (user?.id) {
          const list = await fetchOwnerRestaurants(user.id);
          setRestaurants(list);
          if (list.length > 0) {
            setSelectedRestId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load owner venues:', err);
        showToast('Could not load your restaurants.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadOwnerVenues();
  }, [user?.id]);

  // Load menu for selected restaurant
  useEffect(() => {
    if (!selectedRestId) return;
    async function loadMenu() {
      try {
        setItemsLoading(true);
        const res = await fetchRestaurantMenu(selectedRestId);
        setMenuItems(res.items || []);
      } catch (err) {
        console.error('Failed to load menu:', err);
        showToast('Failed to load menu items.', 'error');
      } finally {
        setItemsLoading(false);
      }
    }
    loadMenu();
  }, [selectedRestId]);

  function handleOpenAdd() {
    setEditingItem(null);
    setFormData(initialDishForm);
    setShowModal(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category: item.category || 'Main Course',
      imageUrl: item.image || item.imageUrl || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      spiceLevel: item.spiceLevel || 'Medium',
      ingredients: item.ingredients || '',
      dietaryInfo: item.dietaryInfo || '',
    });
    setShowModal(true);
  }

  async function handleToggleAvailability(item) {
    try {
      await toggleMenuItemAvailability(item.id);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
      );
      showToast(
        `"${item.name}" marked as ${!item.isAvailable ? 'In Stock' : 'Sold Out'}.`,
        'info'
      );
    } catch (err) {
      showToast('Could not update dish availability.', 'error');
    }
  }

  async function handleDeleteDish(item) {
    if (!window.confirm(`Are you sure you want to remove "${item.name}" from your menu?`)) {
      return;
    }
    try {
      await deleteMenuItem(item.id);
      setMenuItems((prev) => prev.filter((i) => i.id !== item.id));
      triggerReaction('sad', `"${item.name}" has been removed from menu.`);
      showToast(`Removed "${item.name}".`, 'info');
    } catch (err) {
      showToast('Failed to delete menu item.', 'error');
    }
  }

  async function handleSaveDish(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast('Dish name and price are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        const updated = await updateMenuItem(editingItem.id, formData);
        setMenuItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
        triggerReaction('happy', `Updated ${formData.name}!`);
        showToast('Dish details updated successfully.', 'success');
      } else {
        const created = await createMenuItem(selectedRestId, formData);
        setMenuItems((prev) => [created, ...prev]);
        triggerReaction('celebrating', `Awesome! Added ${formData.name} to the menu!`);
        showToast('Dish added to menu successfully!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save dish:', err);
      showToast('Could not save dish. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) return <PageLoader message="Loading menu manager..." />;

  return (
    <div className="bab-owner-page">
      <div className="bab-owner-container">
        {/* Header */}
        <div className="bab-owner-header">
          <div>
            <Link to="/owner/dashboard" className="bab-link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <HiArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Manage Restaurant Menus</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Curate delicious dishes, set prices, and control real-time stock availability.
            </p>
          </div>

          <div className="bab-owner-header__actions">
            {restaurants.length > 1 && (
              <select
                value={selectedRestId || ''}
                onChange={(e) => setSelectedRestId(Number(e.target.value))}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'white',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  color: 'var(--color-text-dark)',
                }}
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            )}

            <button
              className="bab-btn bab-btn--secondary"
              onClick={handleOpenAdd}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <HiPlus size={18} /> Add Dish
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="bab-owner-filter-bar">
          <div className="bab-owner-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`bab-owner-tab-btn ${activeCategory === cat ? 'bab-owner-tab-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: 240 }}>
            <HiOutlineSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bab-form-input"
              style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Items List */}
        {itemsLoading ? (
          <PageLoader message="Fetching dishes..." />
        ) : filteredItems.length > 0 ? (
          <div className="bab-owner-table-wrap" style={{ background: 'white' }}>
            <table className="bab-owner-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Dietary</th>
                  <th>Spice</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-dark)' }}>{item.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {item.description ? `${item.description.slice(0, 45)}...` : 'No description'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="bab-badge" style={{ background: 'var(--color-bg-soft)', fontSize: '0.75rem' }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{item.price}</strong>
                    </td>
                    <td>
                      <span
                        className="bab-badge"
                        style={{
                          background: item.isVeg ? '#F6FFED' : '#FFF1F0',
                          color: item.isVeg ? '#389E0D' : '#CF1322',
                          borderColor: item.isVeg ? '#B7EB8F' : '#FFA39E',
                          fontSize: '0.75rem',
                        }}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {item.spiceLevel}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: item.isAvailable ? '#F6FFED' : '#FFF2E8',
                          color: item.isAvailable ? '#389E0D' : '#D4380D',
                        }}
                      >
                        {item.isAvailable ? '● In Stock' : '○ Sold Out'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="bab-btn bab-btn--outline"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          title="Edit Dish"
                        >
                          <HiOutlinePencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(item)}
                          className="bab-btn bab-btn--outline"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#CF1322', borderColor: '#FFA39E' }}
                          title="Delete Dish"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bab-owner-empty-box" style={{ background: 'white', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)' }}>
            <FoodMascot mood="thinking" size={70} />
            <h4>No dishes found</h4>
            <p>You haven't added any dishes matching this filter yet.</p>
            <button className="bab-btn bab-btn--secondary" onClick={handleOpenAdd} style={{ marginTop: 8 }}>
              + Add First Dish
            </button>
          </div>
        )}

        {/* MODAL: ADD / EDIT DISH */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                maxWidth: 600,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 28,
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', margin: 0 }}>
                  {editingItem ? 'Edit Dish' : 'Add New Menu Item'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  <HiOutlineX size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveDish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="bab-form-label">Dish Name *</label>
                  <input
                    type="text"
                    className="bab-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Truffle Butter Dal Makhani"
                    required
                  />
                </div>

                <div className="bab-wizard-form-grid">
                  <div>
                    <label className="bab-form-label">Category</label>
                    <select
                      className="bab-form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="bab-form-label">Price (₹) *</label>
                    <input
                      type="number"
                      className="bab-form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 450"
                      min="10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="bab-form-label">Description</label>
                  <textarea
                    className="bab-form-textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe taste profile, preparation method, or pairings..."
                  />
                </div>

                <div className="bab-wizard-form-grid">
                  <div>
                    <label className="bab-form-label">Spice Level</label>
                    <select
                      className="bab-form-select"
                      value={formData.spiceLevel}
                      onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                    >
                      {SPICE_LEVELS.map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="bab-form-label">Dietary Type</label>
                    <select
                      className="bab-form-select"
                      value={formData.isVeg ? 'veg' : 'non-veg'}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="bab-form-label">Key Ingredients</label>
                  <input
                    type="text"
                    className="bab-form-input"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="e.g. Black lentils, dairy cream, butter, smoked spices"
                  />
                </div>

                <div>
                  <label className="bab-form-label">Photo Image URL</label>
                  <input
                    type="url"
                    className="bab-form-input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.imageUrl && (
                    <div style={{ marginTop: 8, height: 100, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img src={formData.imageUrl} alt="Dish preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    className="bab-btn bab-btn--outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bab-btn bab-btn--secondary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update Dish' : 'Add Dish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
