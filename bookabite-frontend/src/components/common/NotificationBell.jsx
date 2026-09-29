import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineBell, HiCheck, HiOutlineClock, HiOutlineSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Welcome to BookABite!',
    message: 'Explore hand-crafted menus and book tables across top Pune restaurants.',
    time: 'Just now',
    read: false,
    type: 'welcome',
  },
  {
    id: 2,
    title: 'Chef Recommendation',
    message: 'Try the popular Smoked Butter Chicken at The Spice Terrace tonight.',
    time: '2 hours ago',
    read: false,
    type: 'promo',
  },
  {
    id: 3,
    title: 'Instant Booking Available',
    message: 'Pasta & Pane now has outdoor tables open for dinner reservations.',
    time: '1 day ago',
    read: true,
    type: 'booking',
  },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="bab-notifications-wrapper" ref={panelRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="bab-nav__icon-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        style={{ position: 'relative' }}
      >
        <HiOutlineBell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--bab-secondary)',
            }}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: -10,
              width: 320,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--bab-border)',
              borderRadius: 'var(--bab-radius-md)',
              boxShadow: 'var(--bab-shadow-lg)',
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--bab-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--bab-primary)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bab-badge bab-badge--terracotta">{unreadCount} new</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.78rem',
                    color: 'var(--bab-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(43, 23, 18, 0.05)',
                    background: notif.read ? 'transparent' : 'rgba(214, 90, 58, 0.04)',
                    display: 'flex',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: notif.read ? 'var(--bab-bg-soft)' : 'var(--bab-secondary-light)',
                      color: 'var(--bab-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <HiOutlineSparkles size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: notif.read ? 600 : 700,
                        color: 'var(--bab-text)',
                        marginBottom: 2,
                      }}
                    >
                      {notif.title}
                    </h5>
                    <p style={{ fontSize: '0.78rem', color: 'var(--bab-text-muted)', margin: 0 }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--bab-text-light)', marginTop: 4, display: 'block' }}>
                      {notif.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '10px 16px',
                background: 'var(--bab-bg-soft)',
                textAlign: 'center',
              }}
            >
              <Link
                to="/bookings"
                onClick={() => setIsOpen(false)}
                style={{ fontSize: '0.8rem', color: 'var(--bab-secondary)', fontWeight: 600 }}
              >
                View your reservations & updates →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
