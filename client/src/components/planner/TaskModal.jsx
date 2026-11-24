import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormControls.jsx';
import { LIFE_ROLES, PRIORITY_META, TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants.js';
import { toInputDate, todayISO } from '../../utils/format.js';

export const STATUS_LABELS = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

const empty = (defaultDate) => ({
  title: '',
  description: '',
  date: defaultDate || todayISO(),
  time: '',
  priority: 'Q2',
  status: 'todo',
  role: 'Personal Life',
  completed: false,
});

const TaskModal = ({ open, onClose, onSubmit, onDelete, saving, initial, defaultDate }) => {
  const [form, setForm] = useState(empty(defaultDate));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        date: toInputDate(initial.date),
        time: initial.time || '',
        priority: initial.priority || 'Q2',
        status: initial.status || 'todo',
        role: initial.role || 'Personal Life',
        completed: Boolean(initial.completed),
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
    onSubmit({
      ...form,
      title: form.title.trim(),
      completed: form.status === 'done',
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit task' : 'New task'}
      subtitle="Attach a Covey quadrant and a life role to keep your week balanced."
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
            {initial ? 'Save changes' : 'Add task'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title" required error={error}>
          <Input value={form.title} onChange={change('title')} placeholder="What needs to be done?" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={change('description')} placeholder="Optional details" />
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
          <Field label="Covey quadrant">
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
        <Field label="Status">
          <Select value={form.status} onChange={change('status')}>
            {TASK_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
};

export default TaskModal;
