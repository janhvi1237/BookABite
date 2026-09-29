import React from 'react';
import { HiX, HiOutlineFilter } from 'react-icons/hi';
import FilterPanel from './FilterPanel';

export default function MobileFilterDrawer({ isOpen, onClose, filters, onChange, onReset }) {
  if (!isOpen) return null;

  return (
    <div className="bab-mobile-drawer-overlay" onClick={onClose}>
      <div className="bab-mobile-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="bab-mobile-drawer__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineFilter size={20} color="#D65A3A" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--bab-primary)' }}>Filters</h3>
          </div>
          <button type="button" className="bab-nav__icon-btn" onClick={onClose} aria-label="Close filters">
            <HiX size={22} />
          </button>
        </div>

        <div className="bab-mobile-drawer__body">
          <FilterPanel filters={filters} onChange={onChange} onReset={onReset} />
        </div>

        <div className="bab-mobile-drawer__footer">
          <button type="button" className="bab-btn bab-btn--secondary" onClick={onClose} style={{ width: '100%' }}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
