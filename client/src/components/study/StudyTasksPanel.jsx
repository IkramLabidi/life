import { useMemo, useState } from 'react';
import { Check, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormControls.jsx';
import useCollection from '../../hooks/useCollection.js';
import { STUDY_PRIORITIES, TASK_STATUSES } from '../../utils/constants.js';
import { STATUS_LABELS } from '../planner/TaskModal.jsx';
import { formatDate, toInputDate, todayISO } from '../../utils/format.js';

const PRIORITY_META = {
  high: { label: 'High', color: '#6E8FAE' },
  medium: { label: 'Medium', color: '#B08A57' },
  low: { label: 'Low', color: '#5F8A79' },
};

const FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Completed' },
];

const empty = () => ({ subject: '', title: '', description: '', priority: 'medium', deadline: '', status: 'todo', completed: false });

const StudyTasksPanel = () => {
  const tasks = useCollection('/study-tasks');
  const subjects = useCollection('/subjects');
  const [filter, setFilter] = useState('active');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const subjectMap = useMemo(() => new Map(subjects.items.map((s) => [s._id, s])), [subjects.items]);

  const list = useMemo(() => {
    const sorted = [...tasks.items].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.deadline || 0) - new Date(b.deadline || 0);
    });
    if (filter === 'active') return sorted.filter((t) => !t.completed);
    if (filter === 'done') return sorted.filter((t) => t.completed);
    return sorted;
  }, [tasks.items, filter]);

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const payload = {
        subject: form.subject || null,
        title: form.title.trim(),
        description: form.description,
        priority: form.priority,
        deadline: form.deadline || null,
        status: form.status,
        completed: form.status === 'done',
      };
      if (initial) await tasks.update(initial._id, payload, 'Task updated');
      else await tasks.create(payload, 'Task added');
      setModal(null);
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const toggle = (task) => {
    const completed = !task.completed;
    tasks.update(task._id, { completed, status: completed ? 'done' : 'todo' }, completed ? 'Task completed' : 'Task reopened');
  };

  const remove = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await tasks.remove(confirm.id, 'Task deleted');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const isOverdue = (t) => t.deadline && !t.completed && toInputDate(t.deadline) < todayISO();

  return (
    <Card>
      <CardHeader
        title="Study tasks"
        subtitle="Assignments and study to-dos"
        icon={ListTodo}
        action={
          <div className="flex items-center gap-2">
            <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
            <Button size="sm" icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
              Add
            </Button>
          </div>
        }
      />
      <div className="space-y-2 p-4">
        {list.length ? (
          list.map((task) => {
            const subject = subjectMap.get(task.subject);
            const pm = PRIORITY_META[task.priority] || PRIORITY_META.medium;
            const overdue = isOverdue(task);
            return (
              <div key={task._id} className="group flex items-start gap-3 rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => toggle(task)}
                  aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                  className={`mt-0.5 grid shrink-0 place-items-center rounded-md border transition ${
                    task.completed ? 'border-olive-500 bg-olive-500 text-cream-50' : 'border-sand-300 hover:border-olive-400'
                  }`}
                  style={{ height: 18, width: 18 }}
                >
                  {task.completed && <Check size={12} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold text-espresso-800 ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</p>
                  {task.description && <p className="truncate text-xs text-taupe-500">{task.description}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {subject && <Badge color={subject.color}>{subject.name}</Badge>}
                    <Badge color={pm.color}>{pm.label}</Badge>
                    {task.deadline && (
                      <Badge color={overdue ? '#587A9B' : '#9FAEBC'}>
                        {overdue ? 'Overdue · ' : 'Due '}
                        {formatDate(task.deadline)}
                      </Badge>
                    )}
                    <span className="text-[11px] text-taupe-500">{STATUS_LABELS[task.status]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        initial: task,
                        form: {
                          subject: task.subject || '',
                          title: task.title,
                          description: task.description || '',
                          priority: task.priority,
                          deadline: task.deadline ? toInputDate(task.deadline) : '',
                          status: task.status,
                          completed: task.completed,
                        },
                      })
                    }
                    className="rounded-md p-1.5 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                    aria-label="Edit task"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm({ id: task._id, title: task.title })}
                    className="rounded-md p-1.5 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                    aria-label="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState icon={ListTodo} title="No study tasks" description="Add tasks to plan your study work." />
        )}
      </div>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit study task' : 'Add study task'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Add task'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Title" required>
              <Input value={modal.form.title} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, title: e.target.value } }))} placeholder="e.g. Problem set 4" />
            </Field>
            <Field label="Description">
              <Textarea value={modal.form.description} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))} placeholder="Optional" />
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
              <Field label="Priority">
                <Select value={modal.form.priority} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, priority: e.target.value } }))}>
                  {STUDY_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Deadline">
                <Input type="date" value={modal.form.deadline} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, deadline: e.target.value } }))} />
              </Field>
              <Field label="Status">
                <Select value={modal.form.status} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, status: e.target.value } }))}>
                  {TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete study task?"
        message={`“${confirm?.title}” will be permanently removed.`}
      />
    </Card>
  );
};

export default StudyTasksPanel;
