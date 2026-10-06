import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '../../components/common/Toast';
import { fetchFeeSettings, saveFeeSettings, fetchOwnerBilling } from '../../api/admin';

const FIELDS = [
  ['customer_fee_per_guest', 'Customer booking fee per guest (₹) — 0 makes booking free'],
  ['customer_fee_max', 'Customer booking fee maximum per booking (₹)'],
  ['owner_fee_per_guest', 'Owner platform fee per guest of a completed booking (₹)'],
];

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

export default function FeesBillingTab() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [billing, setBilling] = useState(null);

  const loadBilling = useCallback(async () => {
    try {
      setBilling(await fetchOwnerBilling(month));
    } catch (e) {
      showToast(e.message || 'Could not load billing', 'error');
    }
  }, [month, showToast]);

  useEffect(() => {
    fetchFeeSettings().then(setForm).catch((e) => showToast(e.message || 'Could not load fees', 'error'));
  }, [showToast]);

  useEffect(() => { loadBilling(); }, [loadBilling]);

  const save = async () => {
    setSaving(true);
    try {
      setForm(await saveFeeSettings(form));
      showToast('Fees updated. New bookings use these rates.', 'success');
    } catch (e) {
      showToast(e.message || 'Could not save fees', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3>Fee settings</h3>
      {form && (
        <div style={{ display: 'grid', gap: 12, maxWidth: 520, marginBottom: 24 }}>
          {FIELDS.map(([key, label]) => (
            <label key={key} style={{ display: 'grid', gap: 4 }}>
              <span>{label}</span>
              <input
                type="number" min="0" step="0.5" value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <button type="button" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save fees'}
          </button>
        </div>
      )}

      <h3>Owner billing</h3>
      <label>Month: <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
      {billing && (
        <>
          <div className="bab-admin__stats" style={{ margin: '16px 0' }}>
            {[
              ['Owners owe (completed bookings)', billing.owner_fees_total],
              ['Customers paid (booking fees)', billing.customer_fees_total],
              ['Total platform revenue', billing.platform_revenue],
            ].map(([label, value]) => (
              <div className="bab-admin__stat" key={label}>
                <div>
                  <div className="bab-admin__stat-value">{money(value)}</div>
                  <div className="bab-admin__stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bab-admin__table-wrap">
            <table className="bab-admin__table">
              <thead>
                <tr><th>Restaurant</th><th>Owner</th><th>Completed</th><th>Guests</th><th>Amount due</th></tr>
              </thead>
              <tbody>
                {billing.rows.map((r) => (
                  <tr key={r.restaurant_id}>
                    <td>{r.restaurant_name}</td>
                    <td>{r.owner_name ? `${r.owner_name} (${r.owner_email})` : '—'}</td>
                    <td>{r.completed_bookings}</td>
                    <td>{r.guests}</td>
                    <td>{money(r.amount_due)}</td>
                  </tr>
                ))}
                {billing.rows.length === 0 && (
                  <tr><td colSpan="5" className="bab-admin__empty">No completed bookings this month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
