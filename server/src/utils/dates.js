/** Date helpers shared across controllers. */

export const startOfDay = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (value) => {
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
};

/** Monday-based start of week. */
export const startOfWeek = (value = new Date()) => {
  const d = startOfDay(value);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

export const addDays = (value, days) => {
  const d = new Date(value);
  d.setDate(d.getDate() + days);
  return d;
};

/** "YYYY-MM" key for a date. */
export const monthKey = (value = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** { start, end } Date range covering a "YYYY-MM" month. */
export const monthRange = (month) => {
  const [y, m] = (month || monthKey()).split('-').map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
};

/** Last `count` month keys, oldest first. */
export const lastMonths = (count = 6) => {
  const keys = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
};

export const daysBetween = (a, b) => {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86400000);
};

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const sumBy = (arr, fn) => arr.reduce((acc, item) => acc + (Number(fn(item)) || 0), 0);
