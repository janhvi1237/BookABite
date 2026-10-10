import { useEffect, useRef, useState } from 'react';
import { HiOutlineLocationMarker, HiOutlineSearch } from 'react-icons/hi';
import { fetchRestaurants } from '../../api/restaurants';
import './RestaurantSearchInput.css';

export default function RestaurantSearchInput({
  value,
  onChange,
  onSelect,
  city,
  id,
  placeholder = 'Search restaurants, cuisines, or neighbourhoods...',
  className = '',
  icon = 'search',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const suppressedQuery = useRef(null);
  const query = value.trim();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return undefined;
    }

    if (query === suppressedQuery.current) {
      suppressedQuery.current = null;
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setSuggestions([]);
    setIsOpen(true);
    let current = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchRestaurants({ search: query, city: city || undefined });
        if (current) {
          setSuggestions(results.slice(0, 5));
          setIsOpen(true);
          setActiveIndex(-1);
        }
      } catch (error) {
        console.error('Could not load restaurant suggestions:', error);
        if (current) {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        if (current) setLoading(false);
      }
    }, 250);

    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [query, city]);

  const chooseSuggestion = (restaurant) => {
    suppressedQuery.current = query === restaurant.name ? null : restaurant.name;
    onChange(restaurant.name);
    onSelect?.(restaurant);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions[activeIndex]);
    }
  };

  const Icon = icon === 'location' ? HiOutlineLocationMarker : HiOutlineSearch;
  const listId = `${id}-suggestions`;

  return (
    <div className="bab-restaurant-search">
      <Icon className="bab-restaurant-search__icon" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => {
          suppressedQuery.current = null;
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen && suggestions.length > 0}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      />

      {isOpen && query.length >= 2 && (
        <ul id={listId} className="bab-restaurant-search__suggestions" role="listbox">
          {loading && suggestions.length === 0 ? (
            <li className="bab-restaurant-search__status" role="status">Finding restaurants...</li>
          ) : suggestions.length > 0 ? (
            suggestions.map((restaurant, index) => (
              <li
                key={restaurant.id}
                id={`${listId}-${index}`}
                className={`bab-restaurant-search__option${activeIndex === index ? ' is-active' : ''}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseSuggestion(restaurant)}
              >
                <strong>{restaurant.name}</strong>
                <span>{restaurant.cuisine} · {restaurant.area}, {restaurant.city}</span>
              </li>
            ))
          ) : (
            <li className="bab-restaurant-search__status" role="status">No restaurant suggestions yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
