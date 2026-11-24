import { useMemo, useState } from 'react';
import { CalendarClock, CalendarPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormControls.jsx';
import useCollection from '../../hooks/useCollection.js';
import { DEADLINE_TYPES } from '../../utils/constants.js';
import { formatDate, toInputDate, todayISO } from '../../utils/format.js';

const TYPE_LABELS = { exam: 'Exam', assignment: 'Assignment', project: 'Project', other: 'Other' };
const TYPE_COLORS = { exam: '#6E8FAE', assignment: '#B08A57', project: '#5F8A79', other: '#9FAEBC' };

const empty = () => ({ subject: '', title: '', type: 'assignment', dueDate: todayISO(), description: '' });

const DeadlinesPanel = () => {
  const deadlines = useCollection('/deadlines');
  const subjects = useCollection('/subjects');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const sorted = [...deadlines.items].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const today = todayISO();
    return {
      upcoming: sorted.filter((d) => toInputDate(d.dueDate) >= today),
      past: sorted.filter((d) => toInputDate(d.dueDate) < today).reverse(),
    };
  }, [deadlines.items]);

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const payload = {
        subject: form.subject || null,
        title: form.title.trim(),
        type: form.type,
        dueDate: form.dueDate,
        description: form.description,
      };
      if (initial) await deadlines.update(initial._id, payload, 'Deadline updated');
      else await deadlines.create(payload, 'Deadline added');
      setModal(null);
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await deadlines.remove(confirm.id, 'Deadline deleted');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const renderRow = (d, isPast) => {
    const overdue = isPast;
    return (
      <div key={d._id} className="group flex items-start gap-3 rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${TYPE_COLORS[d.type]}1f`, color: TYPE_COLORS[d.type] }}>
          <CalendarClock size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-espresso-800">{d.title}</p>
          <p className="truncate text-xs text-taupe-500">
            {d.subject?.name || 'General'}
            {d.description ? ` · ${d.description}` : ''}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge color={TYPE_COLORS[d.type]}>{TYPE_LABELS[d.type]}</Badge>
            <Badge color={overdue ? '#587A9B' : '#9FAEBC'}>
              {overdue ? 'Past · ' : 'Due '}
              {formatDate(d.dueDate)}
            </Badge>
            <span className="flex items-center gap-1 text-[11px] text-olive-600">
              <CalendarPlus size={11} /> On calendar
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={() =>
              setModal({
                initial: d,
                form: {
                  subject: d.subject?._id || '',
                  title: d.title,
                  type: d.type,
                  dueDate: toInputDate(d.dueDate),
                  description: d.description || '',
                },
              })
            }
            className="rounded-md p-1.5 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
            aria-label="Edit deadline"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => setConfirm({ id: d._id, title: d.title })}
            className="rounded-md p-1.5 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
            aria-label="Delete deadline"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader
        title="Academic deadlines"
        subtitle="Exams, assignments and projects — each one is added to your calendar automatically"
        icon={CalendarClock}
        action={
          <Button size="sm" icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
            Add deadline
          </Button>
        }
      />
      <div className="space-y-4 p-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-taupe-500">Upcoming</h4>
          <div className="space-y-2">
            {upcoming.length ? upcoming.map((d) => renderRow(d, false)) : <EmptyState icon={CalendarClock} title="Nothing upcoming" description="No future deadlines." />}
          </div>
        </div>
        {past.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-taupe-500">Past</h4>
            <div className="space-y-2 opacity-80">{past.map((d) => renderRow(d, true))}</div>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit deadline' : 'Add deadline'}
        subtitle="Saving will keep your calendar in sync automatically."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Add deadline'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Title" required>
              <Input value={modal.form.title} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, title: e.target.value } }))} placeholder="e.g. Algorithms midterm exam" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subject">
                <Select value={modal.form.subject} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, subject: e.target.value } }))}>
                  <option value="">No subject</option>
                  {subjects.items.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Type">
                <Select value={modal.form.type} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, type: e.target.value } }))}>
                  {DEADLINE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Due date" required>
              <Input type="date" value={modal.form.dueDate} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, dueDate: e.target.value } }))} />
            </Field>
            <Field label="Description">
              <Textarea value={modal.form.description} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))} placeholder="Optional" />
            </Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete deadline?"
        message={`“${confirm?.title}” and its calendar event will be removed.`}
      />
    </Card>
  );
};

export default DeadlinesPanel;
