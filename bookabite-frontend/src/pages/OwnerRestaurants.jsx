import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Store,
  MapPin,
  Clock3,
  X,
  Save,
  Image as ImageIcon,
  Utensils,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  fetchOwnerRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../api/restaurants";

import "./OwnerRestaurants.css";

const emptyForm = {
  name: "",
  description: "",
  address: "",
  area: "",
  city: "Pune",
  cuisine_type: "",
  food_type: "Veg & Non-Veg",
  avg_budget_for_two: "",
  opening_time: "11:00",
  closing_time: "23:00",
  cover_image: "",
  is_instant_booking: false,
};

export default function OwnerRestaurants() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isOwner,
  } = useAuth();

  const ownerId = user?.user_id || user?.id;

  const [restaurants, setRestaurants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isOwner) {
      navigate("/restaurants", { replace: true });
      return;
    }

    if (ownerId) {
      loadRestaurants();
    }
  }, [isAuthenticated, isOwner, ownerId]);

  async function loadRestaurants() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchOwnerRestaurants(ownerId);

      setRestaurants(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error("Owner restaurants error:", err);
      setError(
        err.message ||
          "Unable to load your restaurants."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(restaurant) {
    setEditingId(restaurant.id);

    setForm({
      name: restaurant.name || "",
      description: restaurant.description || "",
      address: restaurant.address || "",
      area: restaurant.area || "",
      city: restaurant.city || "Pune",
      cuisine_type: restaurant.cuisine || "",
      food_type: restaurant.foodType || "Veg & Non-Veg",
      avg_budget_for_two:
        restaurant.priceForTwo || "",
      opening_time:
        restaurant.openingTime || "11:00",
      closing_time:
        restaurant.closingTime || "23:00",
      cover_image:
        restaurant.image || "",
      is_instant_booking:
        restaurant.isInstantBooking || false,
    });

    setError("");
    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Please enter the restaurant name.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter the restaurant address.");
      return;
    }

    if (!form.cuisine_type.trim()) {
      setError("Please enter the cuisine type.");
      return;
    }

    try {
      setSaving(true);

      const restaurantData = {
        owner_id: Number(ownerId),
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        address: form.address.trim(),
        area: form.area.trim() || null,
        city: form.city.trim() || "Pune",
        cuisine_type:
          form.cuisine_type.trim(),
        food_type:
          form.food_type.trim() ||
          "Veg & Non-Veg",
        avg_budget_for_two:
          form.avg_budget_for_two
            ? Number(form.avg_budget_for_two)
            : null,
        opening_time:
          form.opening_time || "11:00",
        closing_time:
          form.closing_time || "23:00",
        cover_image:
          form.cover_image.trim() || null,
        is_instant_booking:
          Boolean(form.is_instant_booking),
      };

      if (editingId) {
        await updateRestaurant(
          editingId,
          restaurantData
        );

        setMessage(
          "Restaurant updated successfully."
        );
      } else {
        await createRestaurant(
          restaurantData
        );

        setMessage(
          "Restaurant added successfully."
        );
      }

      await loadRestaurants();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Restaurant save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save restaurant."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(restaurant) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${restaurant.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(restaurant.id);
      setError("");
      setMessage("");

      await deleteRestaurant(
        restaurant.id
      );

      setRestaurants((current) =>
        current.filter(
          (item) =>
            item.id !== restaurant.id
        )
      );

      setMessage(
        `"${restaurant.name}" deleted successfully.`
      );
    } catch (err) {
      console.error(
        "Restaurant delete error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete restaurant."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (!isAuthenticated || !isOwner) {
    return null;
  }

  return (
    <div className="owner-restaurants-page">
      <div className="owner-restaurants-container">

        {/* HEADER */}
        <header className="owner-restaurants-header">

          <button
            type="button"
            className="owner-back-btn"
            onClick={() =>
              navigate("/owner/dashboard")
            }
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div className="owner-restaurants-title-row">

            <div>
              <div className="owner-restaurants-eyebrow">
                BOOKABITE · OWNER
              </div>

              <h1>
                Manage Restaurants
              </h1>

              <p>
                Add, edit and manage your
                restaurants from one place.
              </p>
            </div>

            {!showForm && (
              <button
                type="button"
                className="owner-add-btn"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add restaurant
              </button>
            )}

          </div>
        </header>

        {/* ALERTS */}

        {message && (
          <div className="owner-restaurants-success">
            <span>{message}</span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="owner-restaurants-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* FORM */}

        {showForm && (
          <section className="owner-restaurant-form-section">

            <div className="owner-form-header">

              <div>
                <span>
                  {editingId
                    ? "EDIT RESTAURANT"
                    : "NEW RESTAURANT"}
                </span>

                <h2>
                  {editingId
                    ? "Edit restaurant"
                    : "Add a restaurant"}
                </h2>
              </div>

              <button
                type="button"
                className="owner-form-close"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="owner-restaurant-form"
              onSubmit={handleSubmit}
            >

              {/* BASIC INFORMATION */}

              <div className="owner-form-block">

                <div className="owner-form-block-title">
                  <Store size={18} />
                  <span>
                    Restaurant information
                  </span>
                </div>

                <div className="owner-form-grid">

                  <div className="owner-field owner-field-full">
                    <label htmlFor="name">
                      Restaurant name *
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. The Spice Terrace"
                      required
                    />
                  </div>

                  <div className="owner-field owner-field-full">
                    <label htmlFor="description">
                      Description
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Tell customers about your restaurant..."
                      rows="4"
                    />
                  </div>

                  <div className="owner-field">
                    <label htmlFor="cuisine_type">
                      Cuisine *
                    </label>

                    <input
                      id="cuisine_type"
                      name="cuisine_type"
                      type="text"
                      value={form.cuisine_type}
                      onChange={handleChange}
                      placeholder="e.g. North Indian"
                      required
                    />
                  </div>

                  <div className="owner-field">
                    <label htmlFor="food_type">
                      Food type
                    </label>

                    <select
                      id="food_type"
                      name="food_type"
                      value={form.food_type}
                      onChange={handleChange}
                    >
                      <option>
                        Veg & Non-Veg
                      </option>

                      <option>
                        Vegetarian
                      </option>

                      <option>
                        Non-Vegetarian
                      </option>

                      <option>
                        Vegan
                      </option>
                    </select>
                  </div>

                </div>
              </div>

              {/* LOCATION */}

              <div className="owner-form-block">

                <div className="owner-form-block-title">
                  <MapPin size={18} />
                  <span>
                    Location
                  </span>
                </div>

                <div className="owner-form-grid">

                  <div className="owner-field owner-field-full">
                    <label htmlFor="address">
                      Full address *
                    </label>

                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street, building and landmark"
                      required
                    />
                  </div>

                  <div className="owner-field">
                    <label htmlFor="area">
                      Area
                    </label>

                    <input
                      id="area"
                      name="area"
                      type="text"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="e.g. Koregaon Park"
                    />
                  </div>

                  <div className="owner-field">
                    <label htmlFor="city">
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Pune"
                    />
                  </div>

                </div>
              </div>

              {/* PRICING + HOURS */}

              <div className="owner-form-block">

                <div className="owner-form-block-title">
                  <Clock3 size={18} />
                  <span>
                    Pricing & opening hours
                  </span>
                </div>

                <div className="owner-form-grid">

                  <div className="owner-field">
                    <label htmlFor="avg_budget_for_two">
                      Average budget for two
                    </label>

                    <div className="owner-input-prefix">
                      <span>₹</span>

                      <input
                        id="avg_budget_for_two"
                        name="avg_budget_for_two"
                        type="number"
                        min="0"
                        value={
                          form.avg_budget_for_two
                        }
                        onChange={handleChange}
                        placeholder="1200"
                      />
                    </div>
                  </div>

                  <div className="owner-field">
                    <label htmlFor="opening_time">
                      Opening time
                    </label>

                    <input
                      id="opening_time"
                      name="opening_time"
                      type="time"
                      value={form.opening_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="owner-field">
                    <label htmlFor="closing_time">
                      Closing time
                    </label>

                    <input
                      id="closing_time"
                      name="closing_time"
                      type="time"
                      value={form.closing_time}
                      onChange={handleChange}
                    />
                  </div>

                </div>
              </div>

              {/* IMAGE */}

              <div className="owner-form-block">

                <div className="owner-form-block-title">
                  <ImageIcon size={18} />
                  <span>
                    Restaurant image
                  </span>
                </div>

                <div className="owner-form-grid">

                  <div className="owner-field owner-field-full">
                    <label htmlFor="cover_image">
                      Cover image URL
                    </label>

                    <input
                      id="cover_image"
                      name="cover_image"
                      type="url"
                      value={form.cover_image}
                      onChange={handleChange}
                      placeholder="https://example.com/restaurant-image.jpg"
                    />

                    <small>
                      Paste a direct image URL.
                    </small>
                  </div>

                </div>
              </div>

              {/* BOOKING SETTINGS */}

              <div className="owner-form-block">

                <label className="owner-checkbox">

                  <input
                    type="checkbox"
                    name="is_instant_booking"
                    checked={
                      form.is_instant_booking
                    }
                    onChange={handleChange}
                  />

                  <span className="owner-checkbox-box" />

                  <span className="owner-checkbox-text">
                    <strong>
                      Enable instant booking
                    </strong>

                    <small>
                      Allow customers to book
                      available tables immediately.
                    </small>
                  </span>

                </label>

              </div>

              {/* FORM ACTIONS */}

              <div className="owner-form-actions">

                <button
                  type="button"
                  className="owner-cancel-form-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="owner-save-btn"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add restaurant"}
                </button>

              </div>

            </form>
          </section>
        )}

        {/* RESTAURANT LIST */}

        <section className="owner-managed-section">

          <div className="owner-managed-heading">
            <div>
              <span>
                YOUR RESTAURANTS
              </span>

              <h2>
                {restaurants.length} restaurant
                {restaurants.length !== 1
                  ? "s"
                  : ""}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="owner-managed-loading">
              <div className="owner-spinner" />
              <p>
                Loading your restaurants...
              </p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="owner-managed-empty">

              <div className="owner-empty-icon">
                <Store size={27} />
              </div>

              <h3>
                No restaurants yet
              </h3>

              <p>
                Add your first restaurant to
                start receiving reservations.
              </p>

              <button
                type="button"
                className="owner-add-btn"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add restaurant
              </button>

            </div>
          ) : (
            <div className="owner-managed-grid">

              {restaurants.map((restaurant) => (

                <article
                  className="owner-managed-card"
                  key={restaurant.id}
                >

                  <div className="owner-managed-image">

                    <img
                      src={
                        restaurant.image ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80"
                      }
                      alt={restaurant.name}
                    />

                    <span>
                      {restaurant.cuisine ||
                        "Multi-Cuisine"}
                    </span>

                  </div>

                  <div className="owner-managed-content">

                    <h3>
                      {restaurant.name}
                    </h3>

                    <p className="owner-managed-description">
                      {restaurant.description ||
                        "No description added yet."}
                    </p>

                    <div className="owner-managed-location">
                      <MapPin size={15} />

                      <span>
                        {restaurant.address ||
                          restaurant.area ||
                          restaurant.city ||
                          "Pune"}
                      </span>
                    </div>

                    <div className="owner-managed-meta">

                      <span>
                        ₹
                        {restaurant.priceForTwo ||
                          1200}
                        <small>
                          {" "}
                          for two
                        </small>
                      </span>

                      <span>
                        {restaurant.openingTime ||
                          "11:00 AM"}{" "}
                        –{" "}
                        {restaurant.closingTime ||
                          "11:00 PM"}
                      </span>

                    </div>

                    <div className="owner-managed-actions">

                      <button
                        type="button"
                        className="owner-menu-manage-btn"
                        onClick={() =>
                          navigate(
                            `/owner/restaurants/${restaurant.id}/menu`
                          )
                        }
                      >
                        <Utensils size={15} />
                        Manage Menu
                      </button>

                      <button
                        type="button"
                        className="owner-edit-btn"
                        onClick={() =>
                          openEditForm(restaurant)
                        }
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="owner-delete-btn"
                        onClick={() =>
                          handleDelete(restaurant)
                        }
                        disabled={
                          deletingId === restaurant.id
                        }
                      >
                        <Trash2 size={15} />

                        {deletingId === restaurant.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>

      </div>
    </div>
  );
}