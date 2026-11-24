import { useEffect, useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormControls.jsx';
import { EVENT_CATEGORIES } from '../../utils/constants.js';
import { toInputDate, todayISO } from '../../utils/format.js';

const empty = (date) => ({
  title: '',
  description: '',
  date: date || todayISO(),
  startTime: '',
  endTime: '',
  category: 'Personal',
  reminder: false,
});

const EventModal = ({ open, onClose, onSubmit, onDelete, saving, initial, defaultDate }) => {
  const [form, setForm] = useState(empty(defaultDate));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        date: toInputDate(initial.date),
        startTime: initial.startTime || '',
        endTime: initial.endTime || '',
        category: initial.category || 'Personal',
        reminder: Boolean(initial.reminder),
      });
    } else {
      setForm(empty(defaultDate));
    }
    setError('');
  }, [open, initial, defaultDate]);

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('A title is required');
      return;
    }
    if (form.endTime && form.startTime && form.endTime < form.startTime) {
      setError('End time cannot be before start time');
      return;
    }
    onSubmit({ ...form, title: form.title.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit event' : 'New event'}
      subtitle="Events, study deadlines and tasks all live on this calendar."
      footer={
        <>
          {initial && onDelete && (
            <Button variant="ghost" className="mr-auto text-terracotta-600" icon={Trash2} onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            {initial ? 'Save changes' : 'Add event'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title" required error={error}>
          <Input value={form.title} onChange={change('title')} placeholder="Event title" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={change('description')} placeholder="Optional details" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" required>
            <Input type="date" value={form.date} onChange={change('date')} />
          </Field>
          <Field label="Start time">
            <Input type="time" value={form.startTime} onChange={change('startTime')} />
          </Field>
          <Field label="End time">
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
        <label className="flex items-center gap-2 text-sm text-espresso-700">
          <input
            type="checkbox"
            checked={form.reminder}
            onChange={(e) => setForm((f) => ({ ...f, reminder: e.target.checked }))}
            className="h-4 w-4 rounded border-sand-300 text-terracotta-500 focus:ring-terracotta-400"
          />
          <Bell size={14} className="text-gold-500" />
          Mark this as important (reminder)
        </label>
      </form>
    </Modal>
  );
};

export default EventModal;
