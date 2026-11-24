import { useMemo, useState } from 'react';
import { CalendarHeart, Info, Moon, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { Field, Input, Textarea } from '../ui/FormControls.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useApiData from '../../hooks/useApiData.js';
import useCollection from '../../hooks/useCollection.js';
import { CYCLE_PHASE_META } from '../../utils/constants.js';
import { formatDate, toInputDate, todayISO } from '../../utils/format.js';

const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const emptyForm = () => ({ periodStart: todayISO(), cycleLength: 28, periodDuration: 5, notes: '' });

const inWindow = (date, start, days) => {
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - s) / 86400000);
  return diff >= 0 && diff < days;
};

const CycleTracker = () => {
  const { user, updatePreferences } = useAuth();
  const enabled = user?.cycleTrackingEnabled;
  const { data, loading, reload } = useApiData('/cycle/current');
  const records = useCollection('/cycle');

  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [enabling, setEnabling] = useState(false);

  const current = data?.current;
  const suggestions = data?.suggestions || [];

  const monthGrid = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
    return cells;
  }, []);

  const isPeriodDay = (day) => {
    if (!current || !day) return false;
    const windows = [
      { start: current.currentPeriodStart, days: current.periodDuration },
      ...(current.upcomingPeriods || []).map((p) => ({ start: p.start, days: current.periodDuration })),
    ];
    return windows.some((w) => inWindow(day, w.start, w.days));
  };

  const isPredictedNext = (day) => {
    if (!current || !day) return false;
    return inWindow(day, current.nextPeriod, current.periodDuration);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        periodStart: form.periodStart,
        cycleLength: Number(form.cycleLength) || 28,
        periodDuration: Number(form.periodDuration) || 5,
        notes: form.notes,
      };
      if (editId) await records.update(editId, payload, 'Cycle record updated');
      else await records.create(payload, 'Cycle record added');
      setForm(emptyForm());
      setEditId(null);
      reload();
    } catch {
      /* toast handled in hook */
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (rec) => {
    setEditId(rec._id);
    setForm({
      periodStart: toInputDate(rec.periodStart),
      cycleLength: rec.cycleLength,
      periodDuration: rec.periodDuration,
      notes: rec.notes || '',
    });
  };

  const remove = async (id) => {
    await records.remove(id, 'Cycle record deleted');
    reload();
  };

  const enable = async () => {
    setEnabling(true);
    try {
      await updatePreferences({ cycleTrackingEnabled: true });
    } finally {
      setEnabling(false);
    }
  };

  if (!enabled) {
    return (
      <Card>
        <CardHeader title="Menstrual cycle tracking" subtitle="Optional & private" icon={ShieldCheck} />
        <div className="flex flex-col items-start gap-3 p-5">
          <div className="flex items-start gap-3 rounded-xl border border-sand-200 bg-cream-50 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-gold-500" />
            <p className="text-sm text-taupe-600">
              This feature is entirely optional and private to your account. It helps you estimate your cycle day and
              phase and offers <strong>optional</strong> energy and workload ideas. Everyone’s body is different — this
              is never a substitute for medical advice.
            </p>
          </div>
          <Button icon={Moon} onClick={enable} loading={enabling}>
            Enable cycle tracking
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader
          title="Current phase"
          subtitle="Estimated from your most recent period start"
          icon={Moon}
          action={
            current ? (
              <span
                className="chip"
                style={{
                  color: CYCLE_PHASE_META[current.phase]?.color,
                  backgroundColor: CYCLE_PHASE_META[current.phase]?.bg,
                }}
              >
                {current.phase}
              </span>
            ) : null
          }
        />
        <div className="p-5">
          {loading && !data ? (
            <p className="text-sm text-taupe-500">Loading…</p>
          ) : current ? (
            <>
              <div className="flex gap-4">
                <div className="flex-1 rounded-xl border border-sand-200 bg-cream-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-taupe-500">Cycle day</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-espresso-900">
                    {current.cycleDay}
                    <span className="text-base text-taupe-500"> / {current.cycleLength}</span>
                  </p>
                </div>
                <div className="flex-1 rounded-xl border border-sand-200 bg-cream-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-taupe-500">Next period</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-espresso-900">
                    {current.daysUntilNextPeriod}
                    <span className="text-base text-taupe-500"> days</span>
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-taupe-500">Approx. next start: {formatDate(current.nextPeriod)}</p>
              {suggestions.length > 0 && (
                <div className="mt-4 rounded-xl border border-olive-400/30 bg-olive-500/5 p-3.5">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-olive-600">
                    Optional energy & workload ideas
                  </p>
                  <ul className="space-y-1.5">
                    {suggestions.map((tip) => (
                      <li key={tip} className="flex gap-2 text-xs leading-relaxed text-taupe-600">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-olive-400" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-taupe-500">
                    These are gentle ideas only — ignore them if they don’t match how you feel.
                  </p>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Moon}
              title="No cycle records yet"
              description="Add your most recent period start to see estimates."
            />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Cycle calendar" subtitle="Approximate — for reference only" icon={CalendarHeart} />
        <div className="p-5">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {WEEKDAY.map((w) => (
              <span key={w} className="text-[11px] font-semibold text-taupe-500">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((day, i) => {
              if (!day) return <span key={`empty-${i}`} />;
              const period = isPeriodDay(day);
              const predicted = !period && isPredictedNext(day);
              const today = toInputDate(day) === todayISO();
              return (
                <div
                  key={day.toISOString()}
                  className={`grid aspect-square place-items-center rounded-lg text-xs font-medium ${
                    today ? 'ring-2 ring-terracotta-400' : ''
                  }`}
                  style={
                    period
                      ? { backgroundColor: '#6E8FAE', color: '#FFFFFF' }
                      : predicted
                        ? { backgroundColor: 'rgba(110, 143, 174,0.18)', color: '#587A9B' }
                        : { backgroundColor: '#EEF2F6', color: '#5F7186' }
                  }
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-taupe-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-terracotta-500" /> Period (recorded / current)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'rgba(110, 143, 174,0.4)' }} /> Predicted
            </span>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="Cycle records"
          subtitle="Add or correct your cycle details"
          icon={Pencil}
          action={
            <Badge color="#9FAEBC">{records.items.length} record{records.items.length === 1 ? '' : 's'}</Badge>
          }
        />
        <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_1fr]">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Period start" required>
                <Input type="date" value={form.periodStart} onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))} />
              </Field>
              <Field label="Cycle length (days)">
                <Input
                  type="number"
                  min="15"
                  max="60"
                  value={form.cycleLength}
                  onChange={(e) => setForm((f) => ({ ...f, cycleLength: e.target.value }))}
                />
              </Field>
              <Field label="Period duration (days)">
                <Input
                  type="number"
                  min="1"
                  max="14"
                  value={form.periodDuration}
                  onChange={(e) => setForm((f) => ({ ...f, periodDuration: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional — e.g. symptoms, corrections" />
            </Field>
            <div className="flex justify-end gap-2">
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditId(null);
                    setForm(emptyForm());
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" icon={editId ? Pencil : Plus} loading={busy}>
                {editId ? 'Save correction' : 'Add record'}
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {records.items.length ? (
              records.items.map((rec) => (
                <div key={rec._id} className="group flex items-center gap-3 rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-terracotta-500/15 text-terracotta-600">
                    <Moon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-espresso-800">{formatDate(rec.periodStart)}</p>
                    <p className="text-xs text-taupe-500">
                      {rec.cycleLength}-day cycle · {rec.periodDuration}-day period
                      {rec.notes ? ` · ${rec.notes}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => startEdit(rec)}
                      className="rounded-md p-1.5 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                      aria-label="Edit record"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(rec._id)}
                      className="rounded-md p-1.5 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                      aria-label="Delete record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Moon} title="No records" description="Add your most recent period start date." />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CycleTracker;
