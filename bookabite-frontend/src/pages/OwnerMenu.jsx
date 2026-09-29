import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Utensils,
  X,
  Save,
  Image as ImageIcon,
  CircleCheck,
  CircleX,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  fetchRestaurantMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "../api/menu";

import "./OwnerMenu.css";


const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Main Course",
  imageUrl: "",
  isVeg: true,
  isAvailable: true,
  spiceLevel: "Medium",
  ingredients: "",
  dietaryInfo: "",
};


export default function OwnerMenu() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const {
    isAuthenticated,
    isOwner,
  } = useAuth();

  const [restaurantName, setRestaurantName] = useState("");

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [availabilityLoading, setAvailabilityLoading] =
    useState(null);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");


  // ==========================================================
  // AUTH + LOAD
  // ==========================================================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isOwner) {
      navigate("/restaurants", { replace: true });
      return;
    }

    if (restaurantId) {
      loadMenu();
    }
  }, [
    isAuthenticated,
    isOwner,
    restaurantId,
  ]);


  // ==========================================================
  // LOAD MENU
  // ==========================================================
  async function loadMenu() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchRestaurantMenu(
        restaurantId
      );

      setRestaurantName(
        data.restaurantName || "Restaurant"
      );

      setItems(
        Array.isArray(data.items)
          ? data.items
          : []
      );

    } catch (err) {
      console.error(
        "Owner menu error:",
        err
      );

      setError(
        err.message ||
          "Unable to load restaurant menu."
      );

    } finally {
      setLoading(false);
    }
  }


  // ==========================================================
  // FORM CHANGE
  // ==========================================================
  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }


  // ==========================================================
  // ADD
  // ==========================================================
  function openAddForm() {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");
    setMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // ==========================================================
  // EDIT
  // ==========================================================
  function openEditForm(item) {
    setEditingId(item.id);

    setForm({
      name: item.name || "",

      description:
        item.description || "",

      price:
        item.price || "",

      category:
        item.category || "Main Course",

      imageUrl:
        item.imageUrl ||
        item.image ||
        "",

      isVeg:
        item.isVeg !== false,

      isAvailable:
        item.isAvailable !== false,

      spiceLevel:
        item.spiceLevel || "Medium",

      ingredients:
        item.ingredients || "",

      dietaryInfo:
        item.dietaryInfo || "",
    });

    setError("");
    setMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // ==========================================================
  // CLOSE FORM
  // ==========================================================
  function closeForm() {
    if (saving) return;

    setShowForm(false);

    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");
  }


  // ==========================================================
  // SAVE
  // ==========================================================
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError(
        "Please enter the menu item name."
      );
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (!form.category.trim()) {
      setError(
        "Please select a category."
      );
      return;
    }


    try {
      setSaving(true);

      const menuData = {
        name: form.name.trim(),

        description:
          form.description.trim(),

        price: Number(form.price),

        category:
          form.category.trim(),

        imageUrl:
          form.imageUrl.trim(),

        isVeg:
          Boolean(form.isVeg),

        isAvailable:
          Boolean(form.isAvailable),

        spiceLevel:
          form.spiceLevel,

        ingredients:
          form.ingredients.trim(),

        dietaryInfo:
          form.dietaryInfo.trim(),
      };


      if (editingId) {

        const updated =
          await updateMenuItem(
            editingId,
            menuData
          );

        setItems((current) =>
          current.map((item) =>
            item.id === editingId
              ? updated
              : item
          )
        );

        setMessage(
          "Menu item updated successfully."
        );

      } else {

        const created =
          await createMenuItem(
            restaurantId,
            menuData
          );

        setItems((current) => [
          ...current,
          created,
        ]);

        setMessage(
          "Menu item added successfully."
        );
      }


      setShowForm(false);

      setEditingId(null);

      setForm({
        ...emptyForm,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(
        "Menu save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save menu item."
      );

    } finally {
      setSaving(false);
    }
  }


  // ==========================================================
  // DELETE
  // ==========================================================
  async function handleDelete(item) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${item.name}"?`
      );

    if (!confirmed) return;


    try {
      setDeletingId(item.id);

      setError("");
      setMessage("");

      await deleteMenuItem(item.id);

      setItems((current) =>
        current.filter(
          (menuItem) =>
            menuItem.id !== item.id
        )
      );

      setMessage(
        `"${item.name}" deleted successfully.`
      );

    } catch (err) {
      console.error(
        "Menu delete error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete menu item."
      );

    } finally {
      setDeletingId(null);
    }
  }


  // ==========================================================
  // AVAILABILITY
  // ==========================================================
  async function handleAvailability(item) {
    try {
      setAvailabilityLoading(item.id);

      setError("");
      setMessage("");

      const result =
        await toggleMenuItemAvailability(
          item.id
        );

      setItems((current) =>
        current.map((menuItem) =>
          menuItem.id === item.id
            ? {
                ...menuItem,
                isAvailable:
                  Boolean(
                    result.is_available
                  ),
              }
            : menuItem
        )
      );

      setMessage(
        result.is_available
          ? `"${item.name}" is now available.`
          : `"${item.name}" is now sold out.`
      );

    } catch (err) {
      console.error(
        "Availability error:",
        err
      );

      setError(
        err.message ||
          "Unable to update availability."
      );

    } finally {
      setAvailabilityLoading(null);
    }
  }


  // ==========================================================
  // AUTH GUARD
  // ==========================================================
  if (
    !isAuthenticated ||
    !isOwner
  ) {
    return null;
  }


  return (
    <div className="owner-menu-page">

      <div className="owner-menu-container">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="owner-menu-header">

          <button
            type="button"
            className="owner-menu-back-btn"
            onClick={() =>
              navigate(
                "/owner/restaurants"
              )
            }
          >
            <ArrowLeft size={17} />
            Manage restaurants
          </button>


          <div className="owner-menu-title-row">

            <div>

              <div className="owner-menu-eyebrow">
                BOOKABITE · OWNER
              </div>

              <h1>
                Manage Menu
              </h1>

              <p>
                {restaurantName}
              </p>

            </div>


            {!showForm && (

              <button
                type="button"
                className="owner-menu-add-btn"
                onClick={
                  openAddForm
                }
              >
                <Plus size={18} />
                Add menu item
              </button>

            )}

          </div>

        </header>


        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {message && (

          <div className="owner-menu-success">

            <CircleCheck size={17} />

            <span>
              {message}
            </span>

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

          <div className="owner-menu-error">

            <CircleX size={17} />

            <span>
              {error}
            </span>

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


        {/* ====================================================
            FORM
        ==================================================== */}

        {showForm && (

          <section className="owner-menu-form-section">

            <div className="owner-menu-form-header">

              <div>

                <span>
                  {editingId
                    ? "EDIT MENU ITEM"
                    : "NEW MENU ITEM"}
                </span>

                <h2>
                  {editingId
                    ? "Edit menu item"
                    : "Add a menu item"}
                </h2>

              </div>


              <button
                type="button"
                className="owner-menu-form-close"
                onClick={
                  closeForm
                }
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>


            <form
              className="owner-menu-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* BASIC INFORMATION */}

              <div className="owner-menu-form-block">

                <div className="owner-menu-form-block-title">

                  <Utensils size={18} />

                  <span>
                    Menu item information
                  </span>

                </div>


                <div className="owner-menu-form-grid">

                  <div className="owner-menu-field owner-menu-field-full">

                    <label htmlFor="menu-name">
                      Item name *
                    </label>

                    <input
                      id="menu-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Paneer Tikka"
                      required
                    />

                  </div>


                  <div className="owner-menu-field owner-menu-field-full">

                    <label htmlFor="menu-description">
                      Description
                    </label>

                    <textarea
                      id="menu-description"
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Describe this dish..."
                      rows="4"
                    />

                  </div>


                  <div className="owner-menu-field">

                    <label htmlFor="menu-category">
                      Category *
                    </label>

                    <select
                      id="menu-category"
                      name="category"
                      value={
                        form.category
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option>
                        Starters
                      </option>

                      <option>
                        Main Course
                      </option>

                      <option>
                        Desserts
                      </option>

                      <option>
                        Beverages
                      </option>

                      <option>
                        Specials
                      </option>
                    </select>

                  </div>


                  <div className="owner-menu-field">

                    <label htmlFor="menu-price">
                      Price *
                    </label>

                    <div className="owner-menu-input-prefix">

                      <span>₹</span>

                      <input
                        id="menu-price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.price
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="350"
                        required
                      />

                    </div>

                  </div>

                </div>

              </div>


              {/* FOOD DETAILS */}

              <div className="owner-menu-form-block">

                <div className="owner-menu-form-block-title">

                  <Utensils size={18} />

                  <span>
                    Food details
                  </span>

                </div>


                <div className="owner-menu-form-grid">

                  <div className="owner-menu-field">

                    <label htmlFor="menu-spice">
                      Spice level
                    </label>

                    <select
                      id="menu-spice"
                      name="spiceLevel"
                      value={
                        form.spiceLevel
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option>
                        Mild
                      </option>

                      <option>
                        Medium
                      </option>

                      <option>
                        Spicy
                      </option>
                    </select>

                  </div>


                  <div className="owner-menu-field">

                    <label htmlFor="menu-food-type">
                      Food type
                    </label>

                    <select
                      id="menu-food-type"
                      name="isVeg"
                      value={
                        form.isVeg
                          ? "veg"
                          : "nonveg"
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            isVeg:
                              event.target.value ===
                              "veg",
                          })
                        )
                      }
                    >
                      <option value="veg">
                        Vegetarian
                      </option>

                      <option value="nonveg">
                        Non-Vegetarian
                      </option>

                    </select>

                  </div>


                  <div className="owner-menu-field owner-menu-field-full">

                    <label htmlFor="menu-ingredients">
                      Ingredients
                    </label>

                    <input
                      id="menu-ingredients"
                      name="ingredients"
                      type="text"
                      value={
                        form.ingredients
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Paneer, onion, tomato, spices..."
                    />

                  </div>


                  <div className="owner-menu-field owner-menu-field-full">

                    <label htmlFor="menu-dietary">
                      Dietary information
                    </label>

                    <input
                      id="menu-dietary"
                      name="dietaryInfo"
                      type="text"
                      value={
                        form.dietaryInfo
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Vegetarian, Gluten-Free, Vegan..."
                    />

                  </div>

                </div>

              </div>


              {/* IMAGE */}

              <div className="owner-menu-form-block">

                <div className="owner-menu-form-block-title">

                  <ImageIcon size={18} />

                  <span>
                    Dish image
                  </span>

                </div>


                <div className="owner-menu-form-grid">

                  <div className="owner-menu-field owner-menu-field-full">

                    <label htmlFor="menu-image">
                      Image URL
                    </label>

                    <input
                      id="menu-image"
                      name="imageUrl"
                      type="url"
                      value={
                        form.imageUrl
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://example.com/dish.jpg"
                    />

                    <small>
                      Paste a direct image URL.
                    </small>

                  </div>

                </div>

              </div>


              {/* AVAILABILITY */}

              <div className="owner-menu-form-block">

                <label className="owner-menu-checkbox">

                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={
                      form.isAvailable
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span className="owner-menu-checkbox-box" />

                  <span className="owner-menu-checkbox-text">

                    <strong>
                      Item is available
                    </strong>

                    <small>
                      Customers can see and order this menu item.
                    </small>

                  </span>

                </label>

              </div>


              {/* ACTIONS */}

              <div className="owner-menu-form-actions">

                <button
                  type="button"
                  className="owner-menu-cancel-btn"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="owner-menu-save-btn"
                  disabled={saving}
                >

                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add menu item"}

                </button>

              </div>

            </form>

          </section>

        )}


        {/* ====================================================
            MENU LIST
        ==================================================== */}

        <section className="owner-menu-managed-section">

          <div className="owner-menu-managed-heading">

            <div>

              <span>
                YOUR MENU
              </span>

              <h2>
                {items.length} item
                {items.length !== 1
                  ? "s"
                  : ""}
              </h2>

            </div>

          </div>


          {loading ? (

            <div className="owner-menu-loading">

              <div className="owner-menu-spinner" />

              <p>
                Loading your menu...
              </p>

            </div>

          ) : items.length === 0 ? (

            <div className="owner-menu-empty">

              <div className="owner-menu-empty-icon">
                <Utensils size={27} />
              </div>

              <h3>
                No menu items yet
              </h3>

              <p>
                Add your first dish to start building your menu.
              </p>

              <button
                type="button"
                className="owner-menu-add-btn"
                onClick={
                  openAddForm
                }
              >
                <Plus size={18} />
                Add menu item
              </button>

            </div>

          ) : (

            <div className="owner-menu-grid">

              {items.map((item) => (

                <article
                  className={`owner-menu-card ${
                    !item.isAvailable
                      ? "owner-menu-card-unavailable"
                      : ""
                  }`}
                  key={item.id}
                >

                  <div className="owner-menu-image">

                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={item.name}
                    />

                    <span>
                      {item.category}
                    </span>

                  </div>


                  <div className="owner-menu-content">

                    <div className="owner-menu-item-top">

                      <div>

                        <h3>
                          {item.name}
                        </h3>

                        <span
                          className={
                            item.isVeg
                              ? "owner-menu-veg"
                              : "owner-menu-nonveg"
                          }
                        >
                          {item.isVeg
                            ? "VEG"
                            : "NON-VEG"}
                        </span>

                      </div>

                      <strong>
                        ₹{item.price}
                      </strong>

                    </div>


                    <p className="owner-menu-description">
                      {item.description ||
                        "No description added yet."}
                    </p>


                    <div className="owner-menu-meta">

                      <span>
                        {item.spiceLevel}
                      </span>

                      {item.dietaryInfo && (
                        <span>
                          {item.dietaryInfo}
                        </span>
                      )}

                    </div>


                    <div className="owner-menu-availability">

                      <button
                        type="button"
                        className={
                          item.isAvailable
                            ? "owner-menu-available-btn"
                            : "owner-menu-soldout-btn"
                        }
                        disabled={
                          availabilityLoading ===
                          item.id
                        }
                        onClick={() =>
                          handleAvailability(
                            item
                          )
                        }
                      >

                        {item.isAvailable ? (
                          <>
                            <CircleCheck size={15} />
                            Available
                          </>
                        ) : (
                          <>
                            <CircleX size={15} />
                            Sold out
                          </>
                        )}

                      </button>

                    </div>


                    <div className="owner-menu-actions">

                      <button
                        type="button"
                        className="owner-menu-edit-btn"
                        onClick={() =>
                          openEditForm(
                            item
                          )
                        }
                      >
                        <Pencil size={15} />
                        Edit
                      </button>


                      <button
                        type="button"
                        className="owner-menu-delete-btn"
                        disabled={
                          deletingId ===
                          item.id
                        }
                        onClick={() =>
                          handleDelete(
                            item
                          )
                        }
                      >

                        <Trash2 size={15} />

                        {deletingId ===
                        item.id
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