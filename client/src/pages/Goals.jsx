import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { Field, Input, Select, Textarea } from '../components/ui/FormControls.jsx';
import useCollection from '../hooks/useCollection.js';
import { GOAL_CATEGORIES, GOAL_CATEGORY_META, GOAL_PERIODS } from '../utils/constants.js';
import { toInputDate, todayISO } from '../utils/format.js';

const empty = () => ({ title: '', description: '', category: 'personal', period: 'monthly', targetDate: '', progress: 0, completed: false });

const Goals = () => {
  const goals = useCollection('/goals');
  const [period, setPeriod] = useState('monthly');
  const [category, setCategory] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
      goals.items
        .filter((g) => g.period === period)
        .filter((g) => category === 'all' || g.category === category)
        .sort((a, b) => Number(a.completed) - Number(b.completed) || b.progress - a.progress),
    [goals.items, period, category]
  );

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const progress = Number(form.progress) || 0;
      const payload = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        period: form.period,
        targetDate: form.targetDate || null,
        progress,
        completed: form.completed || progress >= 100,
      };
      if (initial) await goals.update(initial._id, payload, 'Goal updated');
      else await goals.create(payload, 'Goal added');
      setModal(null);
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const setProgress = (goal, value) => {
    const progress = Math.max(0, Math.min(100, Number(value)));
    goals.update(goal._id, { progress, completed: progress >= 100 }, progress >= 100 ? 'Goal completed!' : 'Progress updated');
  };

  const toggle = (goal) => {
    const completed = !goal.completed;
    goals.update(goal._id, { completed, progress: completed ? 100 : goal.progress }, completed ? 'Goal completed!' : 'Goal reopened');
  };

  const remove = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await goals.remove(confirm.id, 'Goal deleted');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const summary = {
    total: filtered.length,
    done: filtered.filter((g) => g.completed).length,
    avg: filtered.length ? Math.round(filtered.reduce((s, g) => s + g.progress, 0) / filtered.length) : 0,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Goals"
        subtitle="Set meaningful monthly and yearly goals, then watch your progress build."
        actions={
          <Button icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: { ...empty(), period } })}>
            New goal
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-taupe-500">Goals</p>
          <p className="mt-1 font-display text-2xl font-semibold text-espresso-900">{summary.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-taupe-500">Completed</p>
          <p className="mt-1 font-display text-2xl font-semibold text-espresso-900">{summary.done}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-taupe-500">Average progress</p>
          <p className="mt-1 font-display text-2xl font-semibold text-espresso-900">{summary.avg}%</p>
          <ProgressBar className="mt-2" value={summary.avg} color="#B08A57" height={6} />
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          options={GOAL_PERIODS.map((p) => ({ value: p, label: p === 'monthly' ? 'Monthly' : 'Yearly' }))}
          value={period}
          onChange={setPeriod}
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`chip ${category === 'all' ? 'bg-espresso-800 text-cream-100' : 'bg-cream-50 text-taupe-600'}`}
          >
            All
          </button>
          {GOAL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="chip"
              style={
                category === c
                  ? { backgroundColor: GOAL_CATEGORY_META[c].color, color: '#FFFFFF', borderColor: 'transparent' }
                  : { color: GOAL_CATEGORY_META[c].color }
              }
            >
              {GOAL_CATEGORY_META[c].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((goal) => {
            const meta = GOAL_CATEGORY_META[goal.category];
            return (
              <Card key={goal._id} className={`p-4 ${goal.completed ? 'bg-olive-500/5' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggle(goal)}
                      aria-label={goal.completed ? 'Reopen goal' : 'Complete goal'}
                      className={`mt-0.5 grid shrink-0 place-items-center rounded-md border transition ${
                        goal.completed ? 'border-olive-500 bg-olive-500 text-cream-50' : 'border-sand-300 hover:border-olive-400'
                      }`}
                      style={{ height: 20, width: 20 }}
                    >
                      {goal.completed && <Check size={13} />}
                    </button>
                    <div>
                      <p className={`font-display text-base font-semibold text-espresso-900 ${goal.completed ? 'line-through opacity-70' : ''}`}>
                        {goal.title}
                      </p>
                      <Badge className="mt-1" color={meta.color}>
                        {meta.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setModal({ initial: goal, form: { title: goal.title, description: goal.description || '', category: goal.category, period: goal.period, targetDate: goal.targetDate ? toInputDate(goal.targetDate) : '', progress: goal.progress, completed: goal.completed } })}
                      className="rounded-md p-1.5 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                      aria-label="Edit goal"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm({ id: goal._id, title: goal.title })}
                      className="rounded-md p-1.5 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                      aria-label="Delete goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {goal.description && <p className="mt-2 text-xs text-taupe-600">{goal.description}</p>}

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-taupe-500">
                    <span>Progress</span>
                    <span className="font-semibold text-espresso-800">{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} color={meta.color} height={8} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => setProgress(goal, e.target.value)}
                    className="mt-2 w-full accent-terracotta-500"
                    aria-label="Update progress"
                  />
                </div>

                {goal.targetDate && <p className="mt-2 text-xs text-taupe-500">Target: {toInputDate(goal.targetDate)}</p>}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title={`No ${period} goals yet`}
          description="Goals turn wishes into a plan. Add your first one."
          action={<Button icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: { ...empty(), period } })}>New goal</Button>}
        />
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit goal' : 'New goal'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Add goal'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Goal title" required>
              <Input value={modal.form.title} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, title: e.target.value } }))} placeholder="e.g. Save 1500 for an emergency fund" />
            </Field>
            <Field label="Description">
              <Textarea value={modal.form.description} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))} placeholder="Why does this matter?" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select value={modal.form.category} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, category: e.target.value } }))}>
                  {GOAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {GOAL_CATEGORY_META[c].label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Period">
                <Select value={modal.form.period} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, period: e.target.value } }))}>
                  {GOAL_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p === 'monthly' ? 'Monthly' : 'Yearly'}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target date">
                <Input type="date" value={modal.form.targetDate} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, targetDate: e.target.value } }))} />
              </Field>
              <Field label={`Progress · ${modal.form.progress}%`}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={modal.form.progress}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, progress: e.target.value } }))}
                  className="w-full accent-terracotta-500"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-espresso-700">
              <input
                type="checkbox"
                checked={modal.form.completed}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, completed: e.target.checked, progress: e.target.checked ? 100 : m.form.progress } }))}
                className="h-4 w-4 rounded border-sand-300 text-olive-500 focus:ring-olive-400"
              />
              Mark as completed
            </label>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete goal?"
        message={`“${confirm?.title}” will be permanently removed.`}
      />
    </div>
  );
};

export default Goals;
