// Small helpers shared by the booking pages.

// Today's date as YYYY-MM-DD in the user's own timezone
// (toISOString() is UTC and gives yesterday's date early in the day in India).
export function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// "19:30", "19:30:00" or "7:30 PM"  ->  "7:30 PM"
export function formatTime(value) {
  if (!value) return '';
  const m = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/);
  if (!m) return String(value);
  let h = Number(m[1]);
  const mod = m[3] ? m[3].toUpperCase() : null;
  if (mod === 'PM' && h < 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

// YYYY-MM-DD -> "Sat, 3 Oct 2026" (parsed as a local date, no timezone shift)
export function formatDate(value, opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', opts);
}

export function formatMoney(amount) {
  const n = Number(amount || 0);
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

// "7:30 PM" or "19:30" or "19:30:00"  ->  "19:30" (what the API expects)
export function to24(value) {
  if (!value) return '';
  const m = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/);
  if (!m) return '';
  let h = Number(m[1]);
  const mod = m[3] ? m[3].toUpperCase() : null;
  if (mod === 'PM' && h < 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}
