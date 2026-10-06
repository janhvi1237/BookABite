import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineStar,
  HiOutlineClock,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import {
  fetchAdminStats,
  fetchAdminUsers,
  setUserRole,
  setOwnerApproval,
  fetchAdminRestaurants,
  setRestaurantStatus,
  assignRestaurantOwner,
  fetchAdminBookings,
} from '../../api/admin';
import FeesBillingTab from './FeesBillingTab';
import StatisticsReport from '../../components/reports/StatisticsReport';
import './AdminPages.css';

const TABS = [
  ['overview', 'Overview'],
  ['users', 'Users'],
  ['restaurants', 'Restaurants'],
  ['bookings', 'Bookings'],
  ['billing', 'Fees & billing'],
  ['reports', 'Statistics reports'],
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadTab = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'overview') setStats(await fetchAdminStats());
      if (tab === 'users') {
        setUsers(await fetchAdminUsers(roleFilter === 'pending' ? { approval: 'pending', search } : { role: roleFilter, search }));
      }
      if (tab === 'restaurants') {
        const [r, o] = await Promise.all([fetchAdminRestaurants(), fetchAdminUsers({ role: 'owner' })]);
        setRestaurants(r);
        setOwners(o);
      }
      if (tab === 'bookings') setBookings(await fetchAdminBookings());
      if (tab === 'reports') setRestaurants(await fetchAdminRestaurants());
    } catch (err) {
      showToast(err.message || 'Could not load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, roleFilter, search]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  const changeRole = async (target, role) => {
    if (role === target.role) return;
    if (!window.confirm(`Change ${target.full_name} from "${target.role}" to "${role}"?`)) return;
    try {
      await setUserRole(target.user_id, role);
      showToast('Role updated', 'success');
      loadTab();
    } catch (err) {
      showToast(err.message || 'Could not change role', 'error');
    }
  };

  const decideOwner = async (target, approved) => {
    const question = approved
      ? `Approve ${target.full_name} as a restaurant owner?`
      : `Reject ${target.full_name}? Their account becomes a normal customer account.`;
    if (!window.confirm(question)) return;
    try {
      await setOwnerApproval(target.user_id, approved);
      showToast(approved ? 'Owner approved' : 'Owner rejected', 'success');
      loadTab();
    } catch (err) {
      showToast(err.message || 'Could not update owner', 'error');
    }
  };

  const toggleActive = async (r) => {
    try {
      await setRestaurantStatus(r.restaurant_id, !r.is_active);
      showToast(r.is_active ? 'Restaurant hidden from the website' : 'Restaurant is live again', 'success');
      loadTab();
    } catch (err) {
      showToast(err.message || 'Could not update restaurant', 'error');
    }
  };

  const changeOwner = async (r, value) => {
    try {
      await assignRestaurantOwner(r.restaurant_id, value === '' ? null : Number(value));
      showToast('Owner updated', 'success');
      loadTab();
    } catch (err) {
      showToast(err.message || 'Could not assign owner', 'error');
    }
  };

  const statCards = stats
    ? [
        { icon: <HiOutlineUserGroup size={22} />, label: 'Users', value: stats.users, hint: `${stats.customers} customers · ${stats.owners} owners · ${stats.admins} admins` },
        { icon: <HiOutlineClock size={22} />, label: 'Pending owners', value: stats.pending_owners, hint: 'waiting for your approval' },
        { icon: <HiOutlineOfficeBuilding size={22} />, label: 'Restaurants', value: stats.restaurants, hint: `${stats.active_restaurants} live on the website` },
        { icon: <HiOutlineCalendar size={22} />, label: 'Bookings', value: stats.bookings, hint: `${stats.pending_bookings} pending` },
        { icon: <HiOutlineStar size={22} />, label: 'Reviews', value: stats.reviews, hint: 'from customers' },
      ]
    : [];

  return (
    <div className="bab-admin">
      <div className="bab-container">
        <header className="bab-admin__header">
          <h1>Admin Dashboard</h1>
          <p>Signed in as {user?.full_name}</p>
        </header>

        <div className="bab-admin__tabs" role="tablist">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`bab-admin__tab ${tab === key ? 'is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageLoader text="Loading..." />
        ) : (
          <>
            {tab === 'overview' && (
              <div className="bab-admin__stats">
                {statCards.map((c) => (
                  <div className="bab-admin__stat" key={c.label}>
                    <div className="bab-admin__stat-icon">{c.icon}</div>
                    <div>
                      <div className="bab-admin__stat-value">{c.value}</div>
                      <div className="bab-admin__stat-label">{c.label}</div>
                      <div className="bab-admin__stat-hint">{c.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'users' && (
              <>
                <form
                  className="bab-admin__toolbar"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSearch(searchInput.trim());
                  }}
                >
                  <input
                    type="search"
                    placeholder="Search name or email"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All roles</option>
                    <option value="customer">Customers</option>
                    <option value="owner">Owners</option>
                    <option value="admin">Admins</option>
                    <option value="pending">Pending owners</option>
                  </select>
                  <button type="submit" className="bab-btn bab-btn--primary">Search</button>
                </form>

                <div className="bab-admin__table-wrap">
                  <table className="bab-admin__table">
                    <thead>
                      <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.user_id}>
                          <td>{u.user_id}</td>
                          <td>{u.full_name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || '—'}</td>
                          <td>
                            <select
                              value={u.role}
                              disabled={u.user_id === user?.user_id}
                              onChange={(e) => changeRole(u, e.target.value)}
                              title={u.user_id === user?.user_id ? 'You cannot change your own role' : ''}
                            >
                              <option value="customer">customer</option>
                              <option value="owner">owner</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td>
                            {u.role === 'owner' && u.is_approved === false ? (
                              <>
                                <span className="bab-admin__badge is-off">Pending</span>{' '}
                                <button type="button" className="bab-admin__link-btn" onClick={() => decideOwner(u, true)}>Approve</button>{' '}
                                <button type="button" className="bab-admin__link-btn" onClick={() => decideOwner(u, false)}>Reject</button>
                              </>
                            ) : (
                              <span className="bab-admin__badge is-live">Active</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && <tr><td colSpan="6" className="bab-admin__empty">No users found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === 'restaurants' && (
              <div className="bab-admin__table-wrap">
                <table className="bab-admin__table">
                  <thead>
                    <tr><th>ID</th><th>Restaurant</th><th>Area</th><th>Owner</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {restaurants.map((r) => (
                      <tr key={r.restaurant_id}>
                        <td>{r.restaurant_id}</td>
                        <td>{r.name}</td>
                        <td>{r.area || '—'}</td>
                        <td>
                          <select
                            value={r.owner_id ?? ''}
                            onChange={(e) => changeOwner(r, e.target.value)}
                          >
                            <option value="">No owner</option>
                            {owners.map((o) => (
                              <option key={o.user_id} value={o.user_id}>{o.full_name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span className={`bab-admin__badge ${r.is_active ? 'is-live' : 'is-off'}`}>
                            {r.is_active ? 'Live' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="bab-admin__link-btn" onClick={() => toggleActive(r)}>
                            {r.is_active ? 'Hide' : 'Show'}
                          </button>
                          {' · '}
                          <Link className="bab-admin__link-btn" to={`/admin/restaurants/${r.restaurant_id}/tables`}>
                            Tables
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'bookings' && (
              <div className="bab-admin__table-wrap">
                <table className="bab-admin__table">
                  <thead>
                    <tr><th>ID</th><th>Restaurant</th><th>Customer</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.booking_id}>
                        <td>{b.booking_id}</td>
                        <td>{b.restaurant_name || '—'}</td>
                        <td>{b.customer_name || '—'}</td>
                        <td>{b.booking_date}</td>
                        <td>{b.booking_time}</td>
                        <td>{b.party_size}</td>
                        <td>{b.status}</td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan="7" className="bab-admin__empty">No bookings yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'billing' && <FeesBillingTab />}

            {tab === 'reports' && (
              <StatisticsReport restaurants={restaurants} showRestaurantFilter />
            )}
          </>
        )}
      </div>
    </div>
  );
}
