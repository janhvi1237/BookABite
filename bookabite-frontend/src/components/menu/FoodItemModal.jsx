import React, { useState } from 'react';
import { HiX, HiStar, HiHeart, HiOutlineHeart, HiOutlineSparkles, HiPlus, HiMinus } from 'react-icons/hi';
import FoodMascot from '../mascot/FoodMascot';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../common/Toast';

export default function FoodItemModal({ item, onClose }) {
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();
  const [isFav, setIsFav] = useState(false);
  const [qty, setQty] = useState(1);

  if (!item) return null;

  const handleFav = () => {
    setIsFav((prev) => !prev);
    if (!isFav) {
      triggerReaction('happy', `Saved ${item.name} to cravings!`, 3000);
      showToast(`Added ${item.name} to favourites`, 'success');
    }
  };

  const handleAddPlan = () => {
    triggerReaction('celebrating', `Chef Pierre noted ${qty}x ${item.name} for your reservation!`, 4000);
    showToast(`Added ${qty}x ${item.name} to your table plan`, 'success');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(43, 23, 18, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bab-bg-card)',
          borderRadius: 'var(--bab-radius-lg)',
          maxWidth: 580,
          width: '100%',
          overflow: 'hidden',
          boxShadow: 'var(--bab-shadow-lg)',
          border: '1px solid var(--bab-border)',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          aria-label="Close"
        >
          <HiX size={20} />
        </button>

        <div style={{ position: 'relative', width: '100%', height: 260, overflow: 'hidden' }}>
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 8 }}>
            <span className={`bab-food-diet-tag ${item.is_veg ? 'bab-food-diet-tag--veg' : 'bab-food-diet-tag--nonveg'}`}>
              <span className="bab-food-diet-dot" />
            </span>
            <span className="bab-badge bab-badge--gold">{item.category || 'Special'}</span>
          </div>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', color: 'var(--bab-primary)' }}>{item.name}</h3>
              {item.restaurant_name && (
                <p style={{ fontSize: '0.85rem', color: 'var(--bab-secondary)', fontWeight: 600, margin: 0 }}>
                  at {item.restaurant_name} ({item.restaurant_area})
                </p>
              )}
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--bab-secondary)' }}>
              ₹{Number(item.price).toFixed(0)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.9rem' }}>
              <HiStar size={16} color="#E9B44C" />
              <span>{Number(item.rating || 4.8).toFixed(1)}</span>
            </div>
            <span style={{ color: 'var(--bab-border)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--bab-text-muted)' }}>
              Spice: <strong>{item.spice_level || 'Medium'}</strong>
            </span>
            {item.dietary_info && (
              <>
                <span style={{ color: 'var(--bab-border)' }}>•</span>
                <span className="bab-badge bab-badge--terracotta" style={{ fontSize: '0.75rem' }}>
                  {item.dietary_info}
                </span>
              </>
            )}
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--bab-text)', lineHeight: 1.6, marginBottom: 18 }}>
            {item.description}
          </p>

          {item.ingredients && (
            <div style={{ background: 'var(--bab-bg-soft)', padding: 14, borderRadius: 'var(--bab-radius-sm)', marginBottom: 20 }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--bab-primary)', marginBottom: 4 }}>
                Key Ingredients
              </h5>
              <p style={{ fontSize: '0.88rem', color: 'var(--bab-text-muted)', margin: 0 }}>
                {item.ingredients}
              </p>
            </div>
          )}

          {/* Mascot Recommendation tip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bab-secondary-light)', padding: 12, borderRadius: 'var(--bab-radius-sm)', marginBottom: 20 }}>
            <FoodMascot mood="happy" size={54} />
            <p style={{ fontSize: '0.85rem', color: 'var(--bab-secondary)', margin: 0, fontWeight: 600 }}>
              Chef Pierre says: &ldquo;Pairs exceptionally well with our signature artisanal mocktails or a freshly brewed roast!&rdquo;
            </p>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 14, borderTop: '1px solid var(--bab-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="bab-food-card__fav"
                onClick={handleFav}
                style={{ position: 'static', width: 44, height: 44 }}
                aria-label="Save dish"
              >
                {isFav ? <HiHeart size={22} color="#D65A3A" /> : <HiOutlineHeart size={22} />}
              </button>

              <div className="bab-food-qty-stepper" style={{ height: 44, padding: '0 14px' }}>
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}><HiMinus size={14} /></button>
                <span style={{ fontSize: '1rem', minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)}><HiPlus size={14} /></button>
              </div>
            </div>

            <button
              type="button"
              className="bab-btn bab-btn--secondary"
              onClick={handleAddPlan}
              style={{ flex: 1, padding: '12px 20px' }}
            >
              Add to Reservation Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
