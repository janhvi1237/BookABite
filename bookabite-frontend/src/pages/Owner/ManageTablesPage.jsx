import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import {
  fetchRestaurantTables, addRestaurantTable, updateRestaurantTable, deleteRestaurantTable,
} from '../../api/tables';
import './OwnerPages.css';

const TYPES = ['Indoor', 'Outdoor', 'Rooftop', 'Private'];
// Quick start: 4 tables of 2 seats, 4 of 4 seats, 2 of 6 seats
const SAMPLE = [...Array(4).fill(2), ...Array(4).fill(4), ...Array(2).fill(6)];

export default function ManageTablesPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin' || user?.is_admin;

  const [data, setData] = useState(null);
  const [label, setLabel] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [type, setType] = useState('Indoor');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await fetchRestaurantTables(id));
    } catch (e) {
      showToast(e.message || 'Could not load tables', 'error');
    }
  }, [id, showToast]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      await fn();
      if (okMsg) showToast(okMsg, 'success');
      await load();
    } catch (e) {
      showToast(e.message || 'Something went wrong', 'error');
    } finally {
      setBusy(false);
    }
  };

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await addRestaurantTable(id, { table_number: label.trim(), capacity: Number(capacity), table_type: type });
      setLabel('');
    }, 'Table added');
  };

  const addSample = () => run(async () => {
    for (const seats of SAMPLE) {
      await addRestaurantTable(id, { capacity: seats, table_type: 'Indoor' });
    }
  }, 'Sample tables added');

  const tables = data?.tables || [];

  return (
    <div className="bab-owner-page">
      <main className="bab-container bab-owner-container">
        <header className="bab-owner-header">
          <div>
            <span className="bab-section-eyebrow">TABLE INVENTORY</span>
            <h1 className="bab-owner-title">Manage Tables</h1>
            {data && (
              <p>{data.summary.tables} active tables · {data.summary.total_seats} seats · largest table {data.summary.largest_table} seats</p>
            )}
          </div>
          <Link className="bab-btn bab-btn--outline" to={isAdmin ? '/admin' : '/owner/dashboard'}>
            Back to dashboard
          </Link>
        </header>

        <form onSubmit={add} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end', margin: '16px 0' }}>
          <label>Table name (optional)
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="T1" maxLength={20} />
          </label>
          <label>Seats
            <input type="number" min="1" max="20" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          </label>
          <label>Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <button type="submit" disabled={busy}>Add table</button>
          {tables.length === 0 && (
            <button type="button" onClick={addSample} disabled={busy}>Add sample set (10 tables)</button>
          )}
        </form>

        <table className="bab-owner-table">
          <thead><tr><th>Table</th><th>Seats</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.table_id}>
                <td>{t.table_number}</td>
                <td>{t.capacity}</td>
                <td>{t.table_type}</td>
                <td>{t.is_active ? 'On' : 'Off'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button type="button" disabled={busy}
                    onClick={() => run(() => updateRestaurantTable(t.table_id, { is_active: !t.is_active }))}>
                    {t.is_active ? 'Switch off' : 'Switch on'}
                  </button>
                  <button type="button" disabled={busy}
                    onClick={() => window.confirm(`Delete ${t.table_number}?`) &&
                      run(() => deleteRestaurantTable(t.table_id), 'Table deleted')}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tables.length === 0 && (
              <tr><td colSpan="5">No tables yet. Add one above or use the sample set.</td></tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}