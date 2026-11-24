import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Dumbbell, Flame, Pencil, Plus, Trash2, Timer } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import StatCard from '../ui/StatCard.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Field, Input, Textarea } from '../ui/FormControls.jsx';
import useCollection from '../../hooks/useCollection.js';
import { addDays, formatDate, startOfWeek, toInputDate, todayISO } from '../../utils/format.js';

const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const empty = (date) => ({ date: date || todayISO(), type: '', durationMin: 30, notes: '', completed: false });

const ExerciseTracker = () => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekISO = days.map(toInputDate);

  const exercises = useCollection('/exercises');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const weekItems = exercises.items.filter((e) => weekISO.includes(toInputDate(e.date)));
  const totalMin = weekItems.reduce((s, e) => s + (e.durationMin || 0), 0);
  const doneCount = weekItems.filter((e) => e.completed).length;

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.type.trim() || !form.durationMin) return;
    setBusy(true);
    try {
      const payload = {
        date: form.date,
        type: form.type.trim(),
        durationMin: Number(form.durationMin),
        notes: form.notes,
        completed: form.completed,
      };
      if (initial) await exercises.update(initial._id, payload, 'Exercise updated');
      else await exercises.create(payload, 'Exercise added');
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
      await exercises.remove(confirm.id, 'Exercise removed');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (item) => exercises.update(item._id, { completed: !item.completed }, !item.completed ? 'Workout completed' : 'Marked as planned');

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Timer} label="Minutes this week" value={`${totalMin} min`} accent="#6E8FAE" sub={`${weekItems.length} sessions planned`} />
        <StatCard icon={Flame} label="Workouts completed" value={`${doneCount}`} accent="#4E7364" sub={`of ${weekItems.length} this week`} />
        <StatCard icon={Dumbbell} label="Avg per session" value={`${weekItems.length ? Math.round(totalMin / weekItems.length) : 0} min`} accent="#B08A57" sub="Across the week" />
      </div>

      <Card>
        <CardHeader
          title="Weekly exercise table"
          subtitle="Monday to Sunday — mark workouts as done"
          icon={Dumbbell}
          action={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-sand-200 bg-cream-50 p-0.5">
                <button type="button" onClick={() => setWeekStart((w) => addDays(w, -7))} className="rounded-md p-1 text-taupe-500 hover:bg-sand-100" aria-label="Previous week">
                  <ChevronLeft size={15} />
                </button>
                <button type="button" onClick={() => setWeekStart(startOfWeek())} className="rounded-md px-2 py-1 text-[11px] font-semibold text-espresso-700 hover:bg-sand-100">
                  This week
                </button>
                <button type="button" onClick={() => setWeekStart((w) => addDays(w, 7))} className="rounded-md p-1 text-taupe-500 hover:bg-sand-100" aria-label="Next week">
                  <ChevronRight size={15} />
                </button>
              </div>
              <Button size="sm" icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
                Add
              </Button>
            </div>
          }
        />
        <div className="p-4">
          <p className="mb-3 text-xs text-taupe-500">{`${formatDate(days[0])} – ${formatDate(days[6])}`}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
            {days.map((day, i) => {
              const key = toInputDate(day);
              const dayItems = weekItems.filter((e) => toInputDate(e.date) === key);
              const isToday = key === todayISO();
              return (
                <div key={key} className="day-col">
                  <div className={`flex items-center justify-between border-b border-sand-200 pb-2 ${isToday ? 'text-terracotta-600' : ''}`}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide">{WEEKDAY[i]}</p>
                      <p className="text-[11px] text-taupe-500">{day.getDate()}</p>
                    </div>
                    <button type="button" onClick={() => setModal({ initial: null, form: empty(key) })} className="rounded-lg p-1.5 text-taupe-400 transition hover:bg-sand-100 hover:text-espresso-700" aria-label="Add exercise">
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {dayItems.map((item) => (
                      <div key={item._id} className={`group rounded-xl border border-sand-200 bg-cream-50 p-2.5 ${item.completed ? 'opacity-70' : ''}`}>
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => toggle(item)}
                            aria-label={item.completed ? 'Mark as not done' : 'Mark as done'}
                            className={`mt-0.5 grid shrink-0 place-items-center rounded-md border transition ${
                              item.completed ? 'border-olive-500 bg-olive-500 text-cream-50' : 'border-sand-300 hover:border-olive-400'
                            }`}
                            style={{ height: 18, width: 18 }}
                          >
                            {item.completed && <Check size={12} />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold text-espresso-800 ${item.completed ? 'line-through' : ''}`}>{item.type}</p>
                            <p className="text-[11px] text-taupe-500">{item.durationMin} min</p>
                          </div>
                        </div>
                        {item.notes && <p className="mt-1 line-clamp-2 text-[10px] text-taupe-500">{item.notes}</p>}
                        <div className="mt-1.5 flex justify-end gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={() => setModal({ initial: item, form: { date: toInputDate(item.date), type: item.type, durationMin: item.durationMin, notes: item.notes || '', completed: item.completed } })}
                            className="rounded p-0.5 text-taupe-400 hover:text-espresso-700"
                            aria-label="Edit exercise"
                          >
                            <Pencil size={11} />
                          </button>
                          <button type="button" onClick={() => setConfirm({ id: item._id, title: item.type })} className="rounded p-0.5 text-taupe-400 hover:text-terracotta-600" aria-label="Delete exercise">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!weekItems.length && (
            <div className="mt-4">
              <EmptyState icon={Dumbbell} title="No workouts planned" description="Add exercises to each day and tick them off as you go." />
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit exercise' : 'Add exercise'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Add exercise'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Exercise type" required>
              <Input value={modal.form.type} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, type: e.target.value } }))} placeholder="e.g. Running, Strength, Yoga" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" required>
                <Input type="date" value={modal.form.date} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, date: e.target.value } }))} />
              </Field>
              <Field label="Duration (minutes)" required>
                <Input type="number" min="1" value={modal.form.durationMin} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, durationMin: e.target.value } }))} />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea value={modal.form.notes} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, notes: e.target.value } }))} placeholder="Optional" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-espresso-700">
              <input
                type="checkbox"
                checked={modal.form.completed}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, completed: e.target.checked } }))}
                className="h-4 w-4 rounded border-sand-300 text-olive-500 focus:ring-olive-400"
              />
              Completed
            </label>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete exercise?"
        message={`“${confirm?.title}” will be removed from your plan.`}
      />
    </div>
  );
};

export default ExerciseTracker;
