const pad = (n) => String(n).padStart(2, '0');

export const toInputDate = (value) => {
  const d = value ? new Date(value) : new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const todayISO = () => toInputDate(new Date());

export const formatDate = (value, opts) =>
  value
    ? new Date(value).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

export const formatDateShort = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

export const formatWeekday = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { weekday: 'long' }) : '—';

export const formatMonthLabel = (key) => {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(Number(value) || 0);

export const formatTime = (value) => {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const startOfWeek = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
};

export const addDays = (value, days) => {
  const d = new Date(value);
  d.setDate(d.getDate() + days);
  return d;
};

export const isToday = (value) => {
  if (!value) return false;
  const a = new Date(value);
  const b = new Date();
  return (
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  );
};

export const sameDay = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
  );
};

export const daysBetween = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / 86400000);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
