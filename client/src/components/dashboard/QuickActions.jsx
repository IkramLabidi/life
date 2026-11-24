import { useEffect, useState } from 'react';
import { BookOpen, CalendarPlus, ListTodo, Receipt } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormControls.jsx';
import {
  CATEGORY_META,
  EVENT_CATEGORIES,
  EXPENSE_CATEGORIES,
  LIFE_ROLES,
  PRIORITY_META,
  TASK_PRIORITIES,
} from '../../utils/constants.js';
import { todayISO } from '../../utils/format.js';

const ACTIONS = [
  { key: 'expense', label: 'Expense', icon: Receipt, accent: '#6E8FAE' },
  { key: 'task', label: 'Task', icon: ListTodo, accent: '#4E7364' },
  { key: 'session', label: 'Study session', icon: BookOpen, accent: '#B08A57' },
  { key: 'event', label: 'Event', icon: CalendarPlus, accent: '#9FAEBC' },
];

const ENDPOINTS = {
  expense: '/transactions',
  task: '/tasks',
  session: '/study-sessions',
  event: '/events',
};

const QuickActions = ({ onDone }) => {
  const toast = useToast();
  const [type, setType] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (type !== 'session' || subjects.length) return;
    api
      .get('/subjects')
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjects([]));
  }, [type, subjects.length]);

  const open = (key) => {
    const base = { date: todayISO() };
    if (key === 'expense') Object.assign(base, { amount: '', category: 'food', description: '', source: '' });
    if (key === 'task') Object.assign(base, { title: '', priority: 'Q2', role: 'Personal Life', time: '' });
    if (key === 'session') Object.assign(base, { subject: '', durationMin: 60, startTime: '', objectives: '' });
    if (key === 'event') Object.assign(base, { title: '', startTime: '', endTime: '', category: 'Personal' });
    setForm(base);
    setType(key);
  };

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload = { ...form };
      if (type === 'expense') {
        payload = {
          type: 'expense',
          amount: Number(form.amount),
          category: form.category,
          date: form.date,
          description: form.description,
          source: form.source,
        };
      }
      if (type === 'session') {
        payload = {
          subject: form.subject || null,
          date: form.date,
          durationMin: Number(form.durationMin),
          startTime: form.startTime,
          objectives: form.objectives,
        };
      }
      await api.post(ENDPOINTS[type], payload);
      toast.success('Added successfully');
      setType(null);
      onDone?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isDisabled =
    (type === 'expense' && !form.amount) ||
    ((type === 'task' || type === 'event') && !form.title) ||
    (type === 'session' && !form.durationMin);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map(({ key, label, icon: Icon, accent }) => (
          <button
            key={key}
            type="button"
            onClick={() => open(key)}
            className="card card-hover flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ backgroundColor: `${accent}1f`, color: accent }}
            >
              <Icon size={17} />
            </span>
            <span className="text-sm font-semibold text-espresso-800">{label}</span>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(type)}
        onClose={() => setType(null)}
        title={`New ${ACTIONS.find((a) => a.key === type)?.label || ''}`}
        subtitle="Quickly add an entry without leaving the dashboard."
        footer={
          <>
            <Button variant="outline" onClick={() => setType(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving} disabled={isDisabled}>
              Save
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          {type === 'expense' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount" required>
                  <Input type="number" min="0" step="0.01" value={form.amount} onChange={change('amount')} placeholder="0.00" />
                </Field>
                <Field label="Category" required>
                  <Select value={form.category} onChange={change('category')}>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_META[c]?.label || c}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" required>
                  <Input type="date" value={form.date} onChange={change('date')} />
                </Field>
                <Field label="Source / merchant">
                  <Input value={form.source} onChange={change('source')} placeholder="e.g. Grocery store" />
                </Field>
              </div>
              <Field label="Description">
                <Input value={form.description} onChange={change('description')} placeholder="Optional note" />
              </Field>
            </>
          )}

          {type === 'task' && (
            <>
              <Field label="Title" required>
                <Input value={form.title} onChange={change('title')} placeholder="What needs to be done?" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" required>
                  <Input type="date" value={form.date} onChange={change('date')} />
                </Field>
                <Field label="Time">
                  <Input type="time" value={form.time} onChange={change('time')} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Priority (Covey quadrant)">
                  <Select value={form.priority} onChange={change('priority')}>
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_META[p].label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Life role">
                  <Select value={form.role} onChange={change('role')}>
                    {LIFE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </>
          )}

          {type === 'session' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Subject">
                  <Select value={form.subject} onChange={change('subject')}>
                    <option value="">No subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Duration (minutes)" required>
                  <Input type="number" min="1" value={form.durationMin} onChange={change('durationMin')} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" required>
                  <Input type="date" value={form.date} onChange={change('date')} />
                </Field>
                <Field label="Start time">
                  <Input type="time" value={form.startTime} onChange={change('startTime')} />
                </Field>
              </div>
              <Field label="Objectives">
                <Textarea value={form.objectives} onChange={change('objectives')} placeholder="What do you plan to cover?" />
              </Field>
            </>
          )}

          {type === 'event' && (
            <>
              <Field label="Title" required>
                <Input value={form.title} onChange={change('title')} placeholder="Event title" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Date" required>
                  <Input type="date" value={form.date} onChange={change('date')} />
                </Field>
                <Field label="Start">
                  <Input type="time" value={form.startTime} onChange={change('startTime')} />
                </Field>
                <Field label="End">
                  <Input type="time" value={form.endTime} onChange={change('endTime')} />
                </Field>
              </div>
              <Field label="Category" required>
                <Select value={form.category} onChange={change('category')}>
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          )}
        </form>
      </Modal>
    </>
  );
};

export default QuickActions;
