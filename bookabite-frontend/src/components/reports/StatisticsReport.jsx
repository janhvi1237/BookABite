import React, { useEffect, useState } from 'react';
import { fetchStatisticsReport } from '../../api/reports';
import { useToast } from '../common/Toast';
import './StatisticsReport.css';

function localDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(report) {
  const rows = [
    ['Statistics report', report.period.start_date, report.period.end_date],
    [],
    ['Summary metric', 'Value'],
    ...Object.entries(report.summary),
    [],
    ['Daily statistics'],
    ['Date', 'Bookings', 'Guests'],
    ...report.daily.map((row) => [row.date, row.bookings, row.guests]),
    [],
    ['Restaurant statistics'],
    ['Restaurant', 'Bookings', 'Guests', 'Reviews', 'Average rating'],
    ...report.by_restaurant.map((row) => [
      row.restaurant_name, row.bookings, row.guests, row.reviews, row.average_rating,
    ]),
  ];
  const content = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `bookabite-report-${report.period.start_date}-to-${report.period.end_date}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function StatisticsReport({ restaurants = [], showRestaurantFilter = false }) {
  const { showToast } = useToast();
  const today = localDate(new Date());
  const [startDate, setStartDate] = useState(localDate(new Date(Date.now() - 29 * 86400000)));
  const [endDate, setEndDate] = useState(today);
  const [restaurantId, setRestaurantId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    if (!startDate || !endDate || startDate > endDate) {
      showToast('Choose a valid date range.', 'error');
      return;
    }
    setLoading(true);
    try {
      setReport(await fetchStatisticsReport({ startDate, endDate, restaurantId }));
    } catch (error) {
      showToast(error.message || 'Could not generate the statistics report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  // Load the initial report only; further requests are submitted explicitly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = report ? [
    ['Bookings', report.summary.bookings],
    ['Guests', report.summary.guests],
    ['Completed', report.summary.completed],
    ['Cancelled', report.summary.cancelled],
    ['Pending', report.summary.pending],
    ['Confirmed', report.summary.confirmed],
    ['Avg. party size', report.summary.average_party_size],
    ['Paid booking fees', `₹${report.summary.paid_booking_fees.toFixed(2)}`],
    ['Reviews', report.summary.reviews],
    ['Average rating', report.summary.average_rating],
  ] : [];

  return (
    <section className="bab-report">
      <form
        className="bab-report__filters"
        onSubmit={(event) => {
          event.preventDefault();
          loadReport();
        }}
      >
        <label>
          From
          <input type="date" value={startDate} max={endDate || today} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={endDate} min={startDate} max={today} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        {showRestaurantFilter && (
          <label>
            Restaurant
            <select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
              <option value="">All restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.restaurant_id} value={restaurant.restaurant_id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="submit" className="bab-btn bab-btn--primary" disabled={loading}>
          {loading ? 'Generating...' : 'Generate report'}
        </button>
        <button
          type="button"
          className="bab-btn bab-btn--outline"
          onClick={() => report && downloadCsv(report)}
          disabled={!report || loading}
        >
          Download CSV
        </button>
      </form>

      {report && (
        <>
          <div className="bab-report__metrics">
            {metrics.map(([label, value]) => (
              <article className="bab-report__metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

          <div className="bab-report__tables">
            <section className="bab-admin__table-wrap">
              <h3>Daily activity</h3>
              <table className="bab-admin__table">
                <thead><tr><th>Date</th><th>Bookings</th><th>Guests</th></tr></thead>
                <tbody>
                  {report.daily.map((row) => (
                    <tr key={row.date}><td>{row.date}</td><td>{row.bookings}</td><td>{row.guests}</td></tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="bab-admin__table-wrap">
              <h3>By restaurant</h3>
              <table className="bab-admin__table">
                <thead><tr><th>Restaurant</th><th>Bookings</th><th>Guests</th><th>Reviews</th><th>Rating</th></tr></thead>
                <tbody>
                  {report.by_restaurant.map((row) => (
                    <tr key={row.restaurant_id}>
                      <td>{row.restaurant_name}</td><td>{row.bookings}</td><td>{row.guests}</td>
                      <td>{row.reviews}</td><td>{row.average_rating || '—'}</td>
                    </tr>
                  ))}
                  {report.by_restaurant.length === 0 && (
                    <tr><td colSpan="5" className="bab-admin__empty">No restaurants in this report.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </>
      )}
      {!report && !loading && <p role="status">No report data is available.</p>}
    </section>
  );
}
