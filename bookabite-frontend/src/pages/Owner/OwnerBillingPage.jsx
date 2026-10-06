import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiOutlineCreditCard, HiOutlineShieldCheck } from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import { fetchOwnerBilling, payOwnerDues } from '../../api/ownerBilling';
import { useToast } from '../../components/common/Toast';
import './OwnerPages.css';

const PAYMENT_OPTIONS = [
  { id: 'upi', label: 'UPI', detail: 'Demo UPI checkout' },
  { id: 'card', label: 'Card', detail: 'Demo card checkout' },
  { id: 'netbanking', label: 'Net banking', detail: 'Demo bank checkout' },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function OwnerBillingPage() {
  const { showToast } = useToast();
  const [billing, setBilling] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadBilling = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      setBilling(await fetchOwnerBilling());
    } catch (error) {
      setLoadError(error.message || 'Could not load your billing details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  async function handlePayment() {
    if (!billing?.amount_due || paying) return;
    try {
      setPaying(true);
      const result = await payOwnerDues(paymentMethod);
      setBilling(result.billing);
      showToast('Demo payment completed. No real money was charged.', 'success');
    } catch (error) {
      showToast(error.message || 'Could not complete the demo payment.', 'error');
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <PageLoader text="Loading your billing details..." />;

  return (
    <div className="bab-owner-page">
      <main className="bab-container bab-owner-container">
        <header className="bab-owner-header">
          <div>
            <Link to="/owner/dashboard" className="bab-link-action bab-owner-back-link">
              <HiArrowLeft size={16} /> Back to overview
            </Link>
            <span className="bab-section-eyebrow">OWNER ACCOUNT</span>
            <h1 className="bab-owner-title">Payments &amp; dues</h1>
            <p>Review platform fees from completed bookings and settle your outstanding balance.</p>
          </div>
        </header>

        {loadError ? (
          <section className="bab-owner-section bab-owner-error" role="alert">
            <h2>Billing details are unavailable</h2>
            <p>{loadError}</p>
            <button type="button" className="bab-btn bab-btn--secondary" onClick={loadBilling}>
              Try again
            </button>
          </section>
        ) : (
          <>
            <div className="bab-billing-grid">
              <section className="bab-billing-balance">
                <div className="bab-billing-balance__top">
                  <span className="bab-billing-label">Outstanding balance</span>
                  <span className="bab-billing-badge">
                    {billing.amount_due > 0 ? 'Payment due' : 'All settled'}
                  </span>
                </div>
                <strong className="bab-billing-amount">{formatCurrency(billing.amount_due)}</strong>
                <p>
                  Platform fees are added when a reservation is marked completed. Guest booking
                  fees are not included here.
                </p>
                {billing.amount_due > 0 && (
                  <div className="bab-billing-checkout">
                    <fieldset className="bab-payment-methods">
                      <legend>Choose a demo payment method</legend>
                      {PAYMENT_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className={`bab-payment-option${paymentMethod === option.id ? ' bab-payment-option--selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            value={option.id}
                            checked={paymentMethod === option.id}
                            onChange={() => setPaymentMethod(option.id)}
                          />
                          <span>
                            <strong>{option.label}</strong>
                            <small>{option.detail}</small>
                          </span>
                        </label>
                      ))}
                    </fieldset>
                    <button
                      type="button"
                      className="bab-btn bab-btn--secondary bab-billing-pay-button"
                      onClick={handlePayment}
                      disabled={paying}
                    >
                      <HiOutlineCreditCard size={18} />
                      {paying ? 'Processing demo payment…' : `Pay ${formatCurrency(billing.amount_due)}`}
                    </button>
                  </div>
                )}
                <div className="bab-demo-notice">
                  <HiOutlineShieldCheck size={17} />
                  <span>Demo mode — no card, bank, or UPI details are collected and no real charge is made.</span>
                </div>
              </section>

              <section className="bab-billing-summary" aria-label="Billing summary">
                <h2>Billing summary</h2>
                <div className="bab-billing-summary__row">
                  <span>Platform fees earned</span>
                  <strong>{formatCurrency(billing.total_fees)}</strong>
                </div>
                <div className="bab-billing-summary__row">
                  <span>Demo payments made</span>
                  <strong>{formatCurrency(billing.paid_total)}</strong>
                </div>
                <div className="bab-billing-summary__row">
                  <span>Completed bookings</span>
                  <strong>{billing.completed_bookings}</strong>
                </div>
                <div className="bab-billing-summary__total">
                  <span>Amount due</span>
                  <strong>{formatCurrency(billing.amount_due)}</strong>
                </div>
              </section>
            </div>

            <section className="bab-owner-section bab-billing-history">
              <div className="bab-owner-section__header">
                <div>
                  <h2>Payment history</h2>
                  <p>Demo settlements recorded for your account.</p>
                </div>
              </div>
              {billing.payments.length > 0 ? (
                <div className="bab-owner-table-wrap">
                  <table className="bab-owner-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th className="bab-billing-table-amount">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.payments.map((payment) => (
                        <tr key={payment.payment_id}>
                          <td><strong>{payment.reference}</strong></td>
                          <td>{new Date(payment.created_at).toLocaleString('en-IN')}</td>
                          <td>{payment.payment_method.toUpperCase()}</td>
                          <td><span className="bab-billing-paid-status">{payment.status}</span></td>
                          <td className="bab-billing-table-amount">{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bab-billing-history-empty">
                  <HiOutlineCreditCard size={24} />
                  <span>No payments yet. Settlements will appear here after a demo payment.</span>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
