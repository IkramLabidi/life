export const EXPENSE_CATEGORIES = [
  'food',
  'transportation',
  'education',
  'shopping',
  'health',
  'entertainment',
  'other',
];

export const CATEGORY_META = {
  food: { label: 'Food', color: '#6E8FAE' },
  transportation: { label: 'Transportation', color: '#5F8A79' },
  education: { label: 'Education', color: '#B08A57' },
  shopping: { label: 'Shopping', color: '#9FAEBC' },
  health: { label: 'Health', color: '#769887' },
  entertainment: { label: 'Entertainment', color: '#8AA6C1' },
  other: { label: 'Other', color: '#ADB8C4' },
  income: { label: 'Income', color: '#4E7364' },
};

export const TASK_PRIORITIES = ['Q1', 'Q2', 'Q3', 'Q4'];

export const PRIORITY_META = {
  Q1: { label: 'Q1 · Urgent & Important', short: 'Q1', color: '#6E8FAE', bg: 'rgba(110, 143, 174,0.12)' },
  Q2: { label: 'Q2 · Not Urgent & Important', short: 'Q2', color: '#4E7364', bg: 'rgba(78, 115, 100,0.12)' },
  Q3: { label: 'Q3 · Urgent & Not Important', short: 'Q3', color: '#B08A57', bg: 'rgba(176, 138, 87,0.14)' },
  Q4: { label: 'Q4 · Neither Urgent nor Important', short: 'Q4', color: '#9FAEBC', bg: 'rgba(159, 174, 188,0.14)' },
};

export const TASK_STATUSES = ['todo', 'in-progress', 'done'];

export const LIFE_ROLES = [
  'Student',
  'Health',
  'Personal Development',
  'Family',
  'Personal Life',
  'Other',
];

export const ROLE_COLORS = {
  Student: '#6E8FAE',
  Health: '#5F8A79',
  'Personal Development': '#B08A57',
  Family: '#587A9B',
  'Personal Life': '#9FAEBC',
  Other: '#ADB8C4',
};

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export const EVENT_CATEGORIES = ['Academic', 'Personal', 'Health', 'Financial', 'Other'];

export const EVENT_CATEGORY_COLORS = {
  Academic: '#6E8FAE',
  Personal: '#9FAEBC',
  Health: '#5F8A79',
  Financial: '#B08A57',
  Other: '#ADB8C4',
};

export const EVENT_CATEGORY_BG = {
  Academic: 'rgba(110, 143, 174,0.14)',
  Personal: 'rgba(159, 174, 188,0.16)',
  Health: 'rgba(95, 138, 121,0.16)',
  Financial: 'rgba(176, 138, 87,0.16)',
  Other: 'rgba(173, 184, 196,0.18)',
};

export const STUDY_PRIORITIES = ['low', 'medium', 'high'];

export const DEADLINE_TYPES = ['exam', 'assignment', 'project', 'other'];

export const GOAL_CATEGORIES = ['finance', 'education', 'health', 'personal'];

export const GOAL_CATEGORY_META = {
  finance: { label: 'Finance', color: '#B08A57' },
  education: { label: 'Education', color: '#6E8FAE' },
  health: { label: 'Health', color: '#5F8A79' },
  personal: { label: 'Personal Development', color: '#9FAEBC' },
};

export const GOAL_PERIODS = ['monthly', 'yearly'];

export const MOODS = ['great', 'good', 'okay', 'low', 'bad'];

export const MOOD_META = {
  great: { label: 'Great', emoji: '🌟', color: '#4E7364' },
  good: { label: 'Good', emoji: '🙂', color: '#5F8A79' },
  okay: { label: 'Okay', emoji: '😐', color: '#B08A57' },
  low: { label: 'Low', emoji: '😔', color: '#6E8FAE' },
  bad: { label: 'Bad', emoji: '😞', color: '#587A9B' },
};

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CHART_COLORS = ['#6E8FAE', '#5F8A79', '#B08A57', '#9FAEBC', '#8AA6C1', '#769887', '#ADB8C4'];

export const CYCLE_PHASE_META = {
  Menstrual: { color: '#6E8FAE', bg: 'rgba(110, 143, 174,0.14)' },
  Follicular: { color: '#5F8A79', bg: 'rgba(95, 138, 121,0.16)' },
  Ovulation: { color: '#B08A57', bg: 'rgba(176, 138, 87,0.16)' },
  Luteal: { color: '#9FAEBC', bg: 'rgba(159, 174, 188,0.16)' },
};
