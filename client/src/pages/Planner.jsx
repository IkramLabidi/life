import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, Grid2x2, Moon, Plus, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useCollection from '../hooks/useCollection.js';
import useApiData from '../hooks/useApiData.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import WeekBoard from '../components/planner/WeekBoard.jsx';
import QuadrantBoard from '../components/planner/QuadrantBoard.jsx';
import WeeklyGoalsPanel from '../components/planner/WeeklyGoalsPanel.jsx';
import WeeklyReviewPanel from '../components/planner/WeeklyReviewPanel.jsx';
import CycleTracker from '../components/planner/CycleTracker.jsx';
import TaskModal from '../components/planner/TaskModal.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { addDays, formatDate, startOfWeek, toInputDate } from '../utils/format.js';

const TABS = [
  { value: 'board', label: 'Week board' },
  { value: 'quadrants', label: 'Quadrants' },
  { value: 'focus', label: 'Goals & review' },
  { value: 'cycle', label: 'Cycle' },
];

const restKey = (weekISO) => `lifeos_rest_${weekISO}`;

const Planner = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [tab, setTab] = useState('board');
  const [restDays, setRestDays] = useState([]);

  const [taskModal, setTaskModal] = useState(null); // { initial, defaultDate }
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [goalBusy, setGoalBusy] = useState(false);

  const weekISO = toInputDate(weekStart);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekLabel = `${formatDate(days[0])} – ${formatDate(days[6])}`;

  const tasks = useCollection('/tasks');
  const goals = useCollection('/weekly-goals');
  const review = useApiData('/weekly-review', { week: weekISO });

  const weekTasks = useMemo(
    () => tasks.items.filter((t) => toInputDate(t.date) >= weekISO && toInputDate(t.date) <= toInputDate(days[6])),
    [tasks.items, weekISO, days]
  );
  const weekGoals = useMemo(() => goals.items.filter((g) => toInputDate(g.weekStart) === weekISO), [goals.items, weekISO]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(restKey(weekISO)) || '[]');
      setRestDays(Array.isArray(saved) ? saved : []);
    } catch {
      setRestDays([]);
    }
  }, [weekISO]);

  const toggleRest = useCallback(
    (dayKey) => {
      setRestDays((prev) => {
        const next = prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey];
        localStorage.setItem(restKey(weekISO), JSON.stringify(next));
        return next;
      });
    },
    [weekISO]
  );

  // ---------- task handlers ----------
  const submitTask = async (payload) => {
    setBusy(true);
    try {
      if (taskModal?.initial) await tasks.update(taskModal.initial._id, payload, 'Task updated');
      else await tasks.create(payload, 'Task added');
      setTaskModal(null);
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const toggleTask = (task) => {
    const completed = !task.completed;
    tasks.update(task._id, { completed, status: completed ? 'done' : 'todo' }, completed ? 'Task completed' : 'Task reopened');
  };

  const moveTask = (task, dateISO) => {
    tasks.update(task._id, { date: dateISO }, 'Task moved');
  };

  const deleteTask = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === 'task') await tasks.remove(confirm.id, 'Task deleted');
      else if (confirm.kind === 'goal') await goals.remove(confirm.id, 'Goal deleted');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  // ---------- goal handlers ----------
  const addGoal = async (payload) => {
    setGoalBusy(true);
    try {
      await goals.create({ ...payload, weekStart: weekISO, completed: false });
    } finally {
      setGoalBusy(false);
    }
  };
  const updateGoal = async (id, payload) => {
    setGoalBusy(true);
    try {
      await goals.update(id, payload);
    } finally {
      setGoalBusy(false);
    }
  };
  const toggleGoal = (goal) => {
    const completed = !goal.completed;
    goals.update(goal._id, { completed }, completed ? 'Goal completed' : 'Goal reopened');
  };

  // ---------- review ----------
  const saveReview = async (form) => {
    setReviewSaving(true);
    try {
      await api.put('/weekly-review', { weekStart: weekISO, ...form });
      toast.success('Weekly review saved');
      review.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Weekly planner"
        subtitle="Plan Monday to Sunday around what matters most — the 7 Habits way."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-xl border border-sand-200 bg-cream-50 p-1">
              <button
                type="button"
                onClick={() => setWeekStart((w) => addDays(w, -7))}
                className="rounded-lg p-1.5 text-taupe-500 transition hover:bg-sand-100 hover:text-espresso-800"
                aria-label="Previous week"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(startOfWeek())}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-espresso-700 transition hover:bg-sand-100"
              >
                This week
              </button>
              <button
                type="button"
                onClick={() => setWeekStart((w) => addDays(w, 7))}
                className="rounded-lg p-1.5 text-taupe-500 transition hover:bg-sand-100 hover:text-espresso-800"
                aria-label="Next week"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <Button icon={Plus} variant="accent" onClick={() => setTaskModal({ initial: null, defaultDate: weekISO })}>
              Add task
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-taupe-600">
          <CalendarRange size={16} className="text-terracotta-500" />
          <span className="font-semibold text-espresso-800">{weekLabel}</span>
        </div>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === 'board' && (
        <WeekBoard
          days={days}
          tasks={weekTasks}
          restDays={restDays}
          onToggleRest={toggleRest}
          onAdd={(dateISO) => setTaskModal({ initial: null, defaultDate: dateISO })}
          onEdit={(task) => setTaskModal({ initial: task, defaultDate: toInputDate(task.date) })}
          onDelete={(task) => setConfirm({ kind: 'task', id: task._id, title: task.title })}
          onToggle={toggleTask}
          onMove={moveTask}
        />
      )}

      {tab === 'quadrants' && (
        <div>
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sand-200 bg-cream-50 p-4 text-sm text-taupe-600">
            <Grid2x2 size={17} className="mt-0.5 shrink-0 text-terracotta-500" />
            <p>
              Spend more time in <strong className="text-espresso-800">Q2</strong> — it is the quadrant of prevention,
              planning and growth. Aim to shrink Q1 and say no to Q3/Q4.
            </p>
          </div>
          <QuadrantBoard
            tasks={weekTasks}
            onEdit={(task) => setTaskModal({ initial: task, defaultDate: toInputDate(task.date) })}
            onToggle={toggleTask}
            onDelete={(task) => setConfirm({ kind: 'task', id: task._id, title: task.title })}
          />
        </div>
      )}

      {tab === 'focus' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <WeeklyGoalsPanel
            goals={weekGoals}
            busy={goalBusy}
            onAdd={addGoal}
            onUpdate={updateGoal}
            onToggle={toggleGoal}
            onDelete={(id) => setConfirm({ kind: 'goal', id, title: 'this goal' })}
          />
          {review.loading && !review.data ? (
            <Card className="p-5 text-sm text-taupe-500">Loading weekly review…</Card>
          ) : (
            <WeeklyReviewPanel review={review.data} onSave={saveReview} saving={reviewSaving} />
          )}
        </div>
      )}

      {tab === 'cycle' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-sand-200 bg-cream-50 p-4 text-sm text-taupe-600">
            <Moon size={17} className="mt-0.5 shrink-0 text-terracotta-500" />
            <p>
              Cycle tracking is <strong className="text-espresso-800">optional and private</strong>. Estimates are
              approximate and any energy or workload notes are optional ideas — never assumptions about how you feel.
            </p>
          </div>
          <CycleTracker />
        </div>
      )}

      <TaskModal
        open={Boolean(taskModal)}
        onClose={() => setTaskModal(null)}
        onSubmit={submitTask}
        onDelete={
          taskModal?.initial
            ? () => {
                setConfirm({ kind: 'task', id: taskModal.initial._id, title: taskModal.initial.title });
                setTaskModal(null);
              }
            : undefined
        }
        saving={busy}
        initial={taskModal?.initial}
        defaultDate={taskModal?.defaultDate}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={deleteTask}
        loading={busy}
        title="Delete this item?"
        message={`“${confirm?.title}” will be permanently removed.`}
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-taupe-500">
        <Target size={14} />
        <span>
          Rest days are remembered on this device for each week. Everything else syncs to your account.
        </span>
      </div>
    </div>
  );
};

export default Planner;
