import { api } from "./client";

// ============================================================
// MAP MENU ITEM
// ============================================================
export function mapMenuItem(item) {
  if (!item) return null;

  return {
    id: item.item_id,
    itemId: item.item_id,
    restaurantId: item.restaurant_id,

    name: item.name || "",
    description: item.description || "",

    price: Number(item.price || 0),

    category: item.category || "Main Course",

    image:
      item.image_url ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",

    imageUrl: item.image_url || "",

    isVeg: Boolean(item.is_veg),
    isAvailable: Boolean(item.is_available),

    spiceLevel: item.spice_level || "Medium",

    ingredients: item.ingredients || "",
    dietaryInfo: item.dietary_info || "",

    rating: Number(item.rating || 0),
    popularity: Number(item.popularity || 0),

    createdAt: item.created_at || null,

    // snake_case aliases: FoodItemCard, FoodItemModal and FoodDetailsPage
    // read these names, so keep them alongside the camelCase fields above.
    image_url: item.image_url || "",
    is_veg: Boolean(item.is_veg),
    is_available: Boolean(item.is_available),
    spice_level: item.spice_level || "Medium",
    dietary_info: item.dietary_info || "",
    restaurant_id: item.restaurant_id,
    restaurant_name: item.restaurant_name || "",
    restaurant_area: item.restaurant_area || "",
    restaurant_city: item.restaurant_city || "",
  };
}


// ============================================================
// GET MENU FOR RESTAURANT
// GET /api/restaurants/<restaurant_id>/menu
// ============================================================
export async function fetchRestaurantMenu(restaurantId) {
  const data = await api.get(
    `/api/restaurants/${restaurantId}/menu`
  );

  return {
    restaurantId: data?.restaurant_id || restaurantId,

    restaurantName: data?.restaurant_name || "",

    items: Array.isArray(data?.items)
      ? data.items.map(mapMenuItem)
      : [],

    categories: data?.categories || {},

    totalItems: Number(data?.total_items || 0),
  };
}


// ============================================================
// ADD MENU ITEM
// POST /api/restaurants/<restaurant_id>/menu
// ============================================================
export async function createMenuItem(
  restaurantId,
  menuData
) {
  const data = await api.post(
    `/api/restaurants/${restaurantId}/menu`,
    {
      name: menuData.name,
      description: menuData.description || "",
      price: Number(menuData.price),

      category:
        menuData.category || "Main Course",

      image_url:
        menuData.imageUrl ||
        menuData.image_url ||
        null,

      is_veg:
        menuData.isVeg !== undefined
          ? Boolean(menuData.isVeg)
          : true,

      is_available:
        menuData.isAvailable !== undefined
          ? Boolean(menuData.isAvailable)
          : true,

      spice_level:
        menuData.spiceLevel || "Medium",

      ingredients:
        menuData.ingredients || "",

      dietary_info:
        menuData.dietaryInfo || "",
    }
  );

  return mapMenuItem(data?.item);
}

export const addMenuItem = createMenuItem;



// ============================================================
// UPDATE MENU ITEM
// PUT /api/menu/<item_id>
// ============================================================
export async function updateMenuItem(
  itemId,
  menuData
) {
  const data = await api.put(
    `/api/menu/${itemId}`,
    {
      name: menuData.name,
      description: menuData.description || "",
      price: Number(menuData.price),

      category:
        menuData.category || "Main Course",

      image_url:
        menuData.imageUrl ||
        menuData.image_url ||
        null,

      is_veg:
        menuData.isVeg !== undefined
          ? Boolean(menuData.isVeg)
          : true,

      is_available:
        menuData.isAvailable !== undefined
          ? Boolean(menuData.isAvailable)
          : true,

      spice_level:
        menuData.spiceLevel || "Medium",

      ingredients:
        menuData.ingredients || "",

      dietary_info:
        menuData.dietaryInfo || "",
    }
  );

  return mapMenuItem(data?.item);
}


// ============================================================
// TOGGLE MENU ITEM AVAILABILITY
// PATCH /api/menu/<item_id>/availability
// ============================================================
export async function toggleMenuItemAvailability(
  itemId
) {
  return api.patch(
    `/api/menu/${itemId}/availability`
  );
}


// ============================================================
// DELETE MENU ITEM
// DELETE /api/menu/<item_id>
// ============================================================
export async function deleteMenuItem(itemId) {
  return api.delete(
    `/api/menu/${itemId}`
  );
}


// ============================================================
// SEARCH / EXPLORE GLOBAL MENU ITEMS
// GET /api/menu
// ============================================================
export async function fetchMenuItems(filters = {}) {
  const query = new URLSearchParams();
  if (filters.category) query.append('category', filters.category);
  if (filters.isVeg !== undefined && filters.isVeg !== null) query.append('is_veg', filters.isVeg);
  if (filters.search) query.append('search', filters.search);
  if (filters.restaurantId) query.append('restaurant_id', filters.restaurantId);

  const qs = query.toString();
  const data = await api.get(`/api/menu${qs ? `?${qs}` : ''}`);
  return Array.isArray(data) ? data.map(mapMenuItem) : [];
}

// Alias for MenuPage
export async function fetchGlobalMenu(filters = {}) {
  return fetchMenuItems(filters);
}

// ============================================================
// GET SINGLE DISH DETAILS
// GET /api/menu/<item_id>
// ============================================================
export async function fetchDishById(itemId) {
  const data = await api.get(`/api/menu/${itemId}`);
  const item = mapMenuItem(data);
  if (data?.restaurant) {
    item.restaurant = data.restaurant;
  }
  return item;
}