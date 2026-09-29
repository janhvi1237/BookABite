import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  HiStar,
  HiOutlineLocationMarker,
  HiOutlineAdjustments,
  HiOutlineChevronDown,
  HiOutlineRefresh,
  HiX,
} from "react-icons/hi";
import { fetchRestaurants } from "../api/restaurants";
import "./Restaurants.css";

const VIBE_RULES = {
  "Date Night": [
    "couple friendly",
    "rooftop",
    "fine dining",
    "live music",
    "italian",
  ],

  "Quick Bite": [
    "cafe",
    "tibetan",
    "south indian",
    "offers available",
  ],

  "Weekend Brunch": [
    "cafe",
    "outdoor seating",
    "pet friendly",
    "breakfast",
    "brunch",
  ],

  "Solo & Cozy": [
    "cafe",
    "italian",
    "cozy",
    "coffee",
  ],

  "Big Group": [
    "family friendly",
    "buffet",
    "outdoor seating",
    "banquet",
  ],
};

const CUISINE_OPTIONS = [
  "Multi-Cuisine",
  "North Indian",
  "South Indian",
  "Italian",
  "Chinese",
  "Continental",
  "Cafe",
  "Tibetan",
];

const FOOD_TYPE_OPTIONS = [
  "Veg",
  "Non-Veg",
  "Veg & Non-Veg",
];

const RATING_OPTIONS = [
  { label: "Any rating", value: "" },
  { label: "4.5+ ⭐", value: "4.5" },
  { label: "4.0+ ⭐", value: "4" },
  { label: "3.5+ ⭐", value: "3.5" },
];

const PRICE_OPTIONS = [
  { label: "Any budget", value: "" },
  { label: "Under ₹800", value: "800" },
  { label: "Under ₹1,200", value: "1200" },
  { label: "Under ₹1,500", value: "1500" },
  { label: "Under ₹2,000", value: "2000" },
];

const AMENITY_OPTIONS = [
  "Rooftop",
  "Outdoor Seating",
  "Live Music",
  "Pet Friendly",
  "Family Friendly",
  "Couple Friendly",
  "Buffet",
  "Banquet",
];

const SORT_OPTIONS = [
  { label: "Recommended", value: "" },
  { label: "Rating: High to Low", value: "rating_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

export default function Restaurants() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const vibe = searchParams.get("vibe") || "";

  const cuisine = searchParams.get("cuisine") || "";
  const foodType = searchParams.get("food_type") || "";
  const minRating = searchParams.get("min_rating") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const amenity = searchParams.get("amenity") || "";
  const sortBy = searchParams.get("sort_by") || "";

  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState("loading");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /*
   * =========================================================
   * LOAD RESTAURANTS
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurants() {
      try {
        setStatus("loading");

        const data = await fetchRestaurants({
          city: "Pune",
          search,
          cuisine,
          foodType,
          minRating,
          maxPrice,
          amenity,
          sortBy,
        });

        console.log("BOOKABITE RESTAURANTS:", data);

        if (!cancelled) {
          setRestaurants(Array.isArray(data) ? data : []);
          setStatus("ready");
        }
      } catch (error) {
        console.error("BOOKABITE RESTAURANT ERROR:", error);

        if (!cancelled) {
          setRestaurants([]);
          setStatus("error");
        }
      }
    }

    loadRestaurants();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    cuisine,
    foodType,
    minRating,
    maxPrice,
    amenity,
    sortBy,
  ]);

  /*
   * =========================================================
   * URL FILTER HELPERS
   * =========================================================
   */

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    const nextParams = new URLSearchParams();

    if (search) {
      nextParams.set("search", search);
    }

    if (vibe) {
      nextParams.set("vibe", vibe);
    }

    setSearchParams(nextParams);
  };

  const hasAdvancedFilters =
    Boolean(cuisine) ||
    Boolean(foodType) ||
    Boolean(minRating) ||
    Boolean(maxPrice) ||
    Boolean(amenity) ||
    Boolean(sortBy);

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   *
   * Keep this as a local safety filter as well.
   */

  const matchesSearch = (restaurant) => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return true;
    }

    const amenities = Array.isArray(restaurant.amenities)
      ? restaurant.amenities
      : [];

    const searchableText = [
      restaurant.name,
      restaurant.cuisine,
      restaurant.area,
      restaurant.city,
      restaurant.foodType,
      ...amenities,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(term);
  };

  /*
   * =========================================================
   * VIBE SCORE
   * =========================================================
   */

  const getVibeScore = (restaurant) => {
    if (!vibe || !VIBE_RULES[vibe]) {
      return 0;
    }

    const amenities = Array.isArray(restaurant.amenities)
      ? restaurant.amenities
      : [];

    const text = [
      restaurant.name,
      restaurant.cuisine,
      restaurant.area,
      restaurant.city,
      restaurant.foodType,
      ...amenities,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    let score = 0;

    const rules = VIBE_RULES[vibe];

    rules.forEach((rule) => {
      if (text.includes(rule)) {
        score += 5;
      }
    });

    const budget = Number(restaurant.priceForTwo || 0);
    const rating = Number(restaurant.rating || 0);

    if (
      vibe === "Quick Bite" &&
      budget > 0 &&
      budget <= 1000
    ) {
      score += 3;
    }

    if (
      vibe === "Solo & Cozy" &&
      budget > 0 &&
      budget <= 1200
    ) {
      score += 3;
    }

    if (
      vibe === "Date Night" &&
      rating >= 4.5
    ) {
      score += 2;
    }

    return score;
  };

  /*
   * =========================================================
   * LOCAL RESULT SORTING
   * =========================================================
   *
   * Backend already handles sorting, but keeping this here
   * makes the UI robust if the backend returns an unsorted list.
   */

  const filteredRestaurants = useMemo(() => {
    const result = restaurants.filter(matchesSearch);

    if (sortBy === "rating_desc") {
      return [...result].sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    if (sortBy === "price_asc") {
      return [...result].sort(
        (a, b) =>
          Number(a.priceForTwo || 0) -
          Number(b.priceForTwo || 0)
      );
    }

    if (sortBy === "price_desc") {
      return [...result].sort(
        (a, b) =>
          Number(b.priceForTwo || 0) -
          Number(a.priceForTwo || 0)
      );
    }

    if (sortBy === "name_asc") {
      return [...result].sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    if (!vibe) {
      return result;
    }

    return [...result].sort((a, b) => {
      const scoreA = getVibeScore(a);
      const scoreB = getVibeScore(b);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return (
        Number(b.rating || 0) -
        Number(a.rating || 0)
      );
    });
  }, [
    restaurants,
    search,
    vibe,
    sortBy,
  ]);

  /*
   * =========================================================
   * ACTIVE FILTER LABELS
   * =========================================================
   */

  const activeFilters = [];

  if (search) {
    activeFilters.push({
      key: "search",
      label: `Search: ${search}`,
    });
  }

  if (vibe) {
    activeFilters.push({
      key: "vibe",
      label: `Vibe: ${vibe}`,
    });
  }

  if (cuisine) {
    activeFilters.push({
      key: "cuisine",
      label: `Cuisine: ${cuisine}`,
    });
  }

  if (foodType) {
    activeFilters.push({
      key: "food_type",
      label: `Food: ${foodType}`,
    });
  }

  if (minRating) {
    activeFilters.push({
      key: "min_rating",
      label: `Rating: ${minRating}+`,
    });
  }

  if (maxPrice) {
    activeFilters.push({
      key: "max_price",
      label: `Budget: ₹${Number(
        maxPrice
      ).toLocaleString("en-IN")}`,
    });
  }

  if (amenity) {
    activeFilters.push({
      key: "amenity",
      label: amenity,
    });
  }

  if (sortBy) {
    const sortLabel =
      SORT_OPTIONS.find(
        (option) => option.value === sortBy
      )?.label || sortBy;

    activeFilters.push({
      key: "sort_by",
      label: sortLabel,
    });
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <section className="bab-page">
      <div className="container">

        {/* HEADER */}

        <div className="bab-page__header">
          <span className="bab-page__eyebrow">
            PUNE · RESTAURANTS
          </span>

          <h1>
            {vibe
              ? `${vibe} spots in Pune`
              : search
              ? `Restaurants for "${search}"`
              : "Find your table."}
          </h1>

          <p>
            Discover restaurants across Pune and find a
            table that fits your mood.
          </p>
        </div>

        {/* FILTER BAR */}

        <div className="bab-filter-bar">

          <div className="bab-filter-bar__desktop">

            {/* CUISINE */}

            <div className="bab-filter-control">
              <select
                value={cuisine}
                onChange={(event) =>
                  updateFilter(
                    "cuisine",
                    event.target.value
                  )
                }
                aria-label="Cuisine"
              >
                <option value="">
                  Cuisine
                </option>

                {CUISINE_OPTIONS.map((option) => (
                  <option
                    value={option}
                    key={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              <HiOutlineChevronDown size={15} />
            </div>

            {/* FOOD TYPE */}

            <div className="bab-filter-control">
              <select
                value={foodType}
                onChange={(event) =>
                  updateFilter(
                    "food_type",
                    event.target.value
                  )
                }
                aria-label="Food type"
              >
                <option value="">
                  Food Type
                </option>

                {FOOD_TYPE_OPTIONS.map((option) => (
                  <option
                    value={option}
                    key={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              <HiOutlineChevronDown size={15} />
            </div>

            {/* RATING */}

            <div className="bab-filter-control">
              <select
                value={minRating}
                onChange={(event) =>
                  updateFilter(
                    "min_rating",
                    event.target.value
                  )
                }
                aria-label="Minimum rating"
              >
                {RATING_OPTIONS.map((option) => (
                  <option
                    value={option.value}
                    key={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <HiOutlineChevronDown size={15} />
            </div>

            {/* BUDGET */}

            <div className="bab-filter-control">
              <select
                value={maxPrice}
                onChange={(event) =>
                  updateFilter(
                    "max_price",
                    event.target.value
                  )
                }
                aria-label="Budget"
              >
                {PRICE_OPTIONS.map((option) => (
                  <option
                    value={option.value}
                    key={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <HiOutlineChevronDown size={15} />
            </div>

            {/* AMENITY */}

            <div className="bab-filter-control">
              <select
                value={amenity}
                onChange={(event) =>
                  updateFilter(
                    "amenity",
                    event.target.value
                  )
                }
                aria-label="Amenities"
              >
                <option value="">
                  Amenities
                </option>

                {AMENITY_OPTIONS.map((option) => (
                  <option
                    value={option}
                    key={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              <HiOutlineChevronDown size={15} />
            </div>

            {/* SORT */}

            <div className="bab-filter-control bab-filter-control--sort">
              <select
                value={sortBy}
                onChange={(event) =>
                  updateFilter(
                    "sort_by",
                    event.target.value
                  )
                }
                aria-label="Sort restaurants"
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    value={option.value}
                    key={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <HiOutlineChevronDown size={15} />
            </div>

            {/* RESET */}

            {hasAdvancedFilters && (
              <button
                type="button"
                className="bab-filter-reset"
                onClick={resetFilters}
              >
                <HiOutlineRefresh size={15} />
                Reset
              </button>
            )}
          </div>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            className="bab-mobile-filter-button"
            onClick={() =>
              setMobileFiltersOpen(
                (current) => !current
              )
            }
          >
            <HiOutlineAdjustments size={18} />

            <span>
              Filters
              {hasAdvancedFilters
                ? " · Active"
                : ""}
            </span>

            {mobileFiltersOpen ? (
              <HiX size={17} />
            ) : (
              <HiOutlineChevronDown size={17} />
            )}
          </button>

          {/* MOBILE PANEL */}

          {mobileFiltersOpen && (
            <div className="bab-mobile-filter-panel">

              <div className="bab-mobile-filter-header">
                <div>
                  <span>
                    REFINE RESULTS
                  </span>

                  <h2>
                    Find your perfect spot
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileFiltersOpen(false)
                  }
                  aria-label="Close filters"
                >
                  <HiX size={19} />
                </button>
              </div>

              {/* CUISINE */}

              <label className="bab-mobile-filter-field">
                <span>Cuisine</span>

                <select
                  value={cuisine}
                  onChange={(event) =>
                    updateFilter(
                      "cuisine",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Any cuisine
                  </option>

                  {CUISINE_OPTIONS.map((option) => (
                    <option
                      value={option}
                      key={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {/* FOOD TYPE */}

              <label className="bab-mobile-filter-field">
                <span>Food type</span>

                <select
                  value={foodType}
                  onChange={(event) =>
                    updateFilter(
                      "food_type",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Any food type
                  </option>

                  {FOOD_TYPE_OPTIONS.map((option) => (
                    <option
                      value={option}
                      key={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {/* RATING */}

              <label className="bab-mobile-filter-field">
                <span>Minimum rating</span>

                <select
                  value={minRating}
                  onChange={(event) =>
                    updateFilter(
                      "min_rating",
                      event.target.value
                    )
                  }
                >
                  {RATING_OPTIONS.map((option) => (
                    <option
                      value={option.value}
                      key={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* BUDGET */}

              <label className="bab-mobile-filter-field">
                <span>Budget for two</span>

                <select
                  value={maxPrice}
                  onChange={(event) =>
                    updateFilter(
                      "max_price",
                      event.target.value
                    )
                  }
                >
                  {PRICE_OPTIONS.map((option) => (
                    <option
                      value={option.value}
                      key={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* AMENITY */}

              <label className="bab-mobile-filter-field">
                <span>Amenity</span>

                <select
                  value={amenity}
                  onChange={(event) =>
                    updateFilter(
                      "amenity",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Any amenity
                  </option>

                  {AMENITY_OPTIONS.map((option) => (
                    <option
                      value={option}
                      key={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {/* SORT */}

              <label className="bab-mobile-filter-field">
                <span>Sort by</span>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    updateFilter(
                      "sort_by",
                      event.target.value
                    )
                  }
                >
                  {SORT_OPTIONS.map((option) => (
                    <option
                      value={option.value}
                      key={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="bab-mobile-filter-actions">
                <button
                  type="button"
                  className="bab-mobile-filter-reset"
                  onClick={resetFilters}
                >
                  <HiOutlineRefresh size={16} />
                  Reset filters
                </button>

                <button
                  type="button"
                  className="bab-mobile-filter-done"
                  onClick={() =>
                    setMobileFiltersOpen(false)
                  }
                >
                  Show restaurants
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE FILTERS */}

        {activeFilters.length > 0 && (
          <div className="bab-page__filters">
            {activeFilters.map((filter) => (
              <span
                className="bab-page__filter"
                key={`${filter.key}-${filter.label}`}
              >
                {filter.label}

                {(filter.key !== "search" &&
                  filter.key !== "vibe") && (
                  <button
                    type="button"
                    onClick={() =>
                      updateFilter(
                        filter.key,
                        ""
                      )
                    }
                    aria-label={`Remove ${filter.label}`}
                  >
                    <HiX size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* LOADING */}

        {status === "loading" && (
          <div className="bab-restaurant-grid">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  className="bab-restaurant-card bab-restaurant-card--skeleton"
                  key={index}
                >
                  <div className="bab-restaurant-card__image-wrap" />

                  <div className="bab-restaurant-card__body">
                    <div className="bab-skeleton-line" />
                    <div className="bab-skeleton-line bab-skeleton-line--short" />
                    <div className="bab-skeleton-line bab-skeleton-line--tiny" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ERROR */}

        {status === "error" && (
          <div className="bab-empty-state">
            <span className="bab-empty-state__icon">
              ⚠
            </span>

            <h2>
              We couldn't load the restaurants.
            </h2>

            <p>
              Make sure the BookABite Flask backend is
              running on port 5000.
            </p>

            <button
              type="button"
              className="bab-empty-state__button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {/* RESULTS */}

        {status === "ready" && (
          <>
            <div className="bab-results-heading">
              <span>
                {filteredRestaurants.length}{" "}
                {filteredRestaurants.length === 1
                  ? "restaurant"
                  : "restaurants"}{" "}
                found
              </span>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="bab-empty-state">
                <span className="bab-empty-state__icon">
                  ✦
                </span>

                <h2>
                  No restaurants found.
                </h2>

                <p>
                  Try changing your filters, restaurant
                  name, cuisine, or area.
                </p>

                {(search ||
                  vibe ||
                  hasAdvancedFilters) && (
                  <button
                    type="button"
                    className="bab-empty-state__button"
                    onClick={() =>
                      navigate("/restaurants")
                    }
                  >
                    View all restaurants
                  </button>
                )}
              </div>
            ) : (
              <div className="bab-restaurant-grid">
                {filteredRestaurants.map(
                  (restaurant) => (
                    <article
                      className="bab-restaurant-card"
                      key={restaurant.id}
                      onClick={() =>
                        navigate(
                          `/restaurants/${restaurant.id}`
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          navigate(
                            `/restaurants/${restaurant.id}`
                          );
                        }
                      }}
                    >
                      {/* IMAGE */}

                      <div className="bab-restaurant-card__image-wrap">
                        {restaurant.image ? (
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="bab-restaurant-card__image-placeholder">
                            {restaurant.name?.charAt(0) ||
                              "B"}
                          </div>
                        )}
                      </div>

                      {/* BODY */}

                      <div className="bab-restaurant-card__body">
                        <div className="bab-restaurant-card__top">
                          <h2>
                            {restaurant.name ||
                              "Restaurant"}
                          </h2>

                          <span className="bab-restaurant-card__rating">
                            <HiStar size={14} />

                            {restaurant.rating
                              ? Number(
                                  restaurant.rating
                                ).toFixed(1)
                              : "New"}
                          </span>
                        </div>

                        <p className="bab-restaurant-card__cuisine">
                          {Array.isArray(
                            restaurant.cuisine
                          )
                            ? restaurant.cuisine.join(
                                " · "
                              )
                            : restaurant.cuisine ||
                              "Multi-Cuisine"}
                        </p>

                        <p className="bab-restaurant-card__area">
                          <HiOutlineLocationMarker
                            size={14}
                          />

                          <span>
                            {restaurant.area ||
                              restaurant.city ||
                              "Pune"}

                            {restaurant.priceForTwo && (
                              <>
                                {" · ₹"}
                                {Number(
                                  restaurant.priceForTwo
                                ).toLocaleString(
                                  "en-IN"
                                )}
                                {" for two"}
                              </>
                            )}
                          </span>
                        </p>

                        {/* AMENITIES */}

                        {Array.isArray(
                          restaurant.amenities
                        ) &&
                          restaurant.amenities.length >
                            0 && (
                            <div className="bab-restaurant-card__tags">
                              {restaurant.amenities
                                .slice(0, 3)
                                .map((amenityItem) => (
                                  <span
                                    className="bab-restaurant-card__tag"
                                    key={`${restaurant.id}-${amenityItem}`}
                                  >
                                    {amenityItem}
                                  </span>
                                ))}
                            </div>
                          )}
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}