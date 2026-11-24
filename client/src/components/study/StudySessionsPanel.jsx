import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import StatCard from '../ui/StatCard.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormControls.jsx';
import ChartCard, { ChartTooltip } from '../charts/Charts.jsx';
import useCollection from '../../hooks/useCollection.js';
import { CHART_COLORS } from '../../utils/constants.js';
import { addDays, formatDate, formatTime, startOfWeek, toInputDate, todayISO } from '../../utils/format.js';

const empty = () => ({ subject: '', date: todayISO(), startTime: '', durationMin: 60, objectives: '', notes: '' });

const StudySessionsPanel = () => {
  const sessions = useCollection('/study-sessions');
  const subjects = useCollection('/subjects');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const subjectMap = useMemo(() => new Map(subjects.items.map((s) => [s._id, s])), [subjects.items]);
  const weekStart = useMemo(() => startOfWeek(), []);
  const weekISO = Array.from({ length: 7 }, (_, i) => toInputDate(addDays(weekStart, i)));

  const totalMin = sessions.items.reduce((s, x) => s + (x.durationMin || 0), 0);
  const weekItems = sessions.items.filter((s) => weekISO.includes(toInputDate(s.date)));
  const weekMin = weekItems.reduce((s, x) => s + (x.durationMin || 0), 0);
  const avg = sessions.items.length ? Math.round(totalMin / sessions.items.length) : 0;

  const dailyChart = weekISO.map((iso, i) => {
    const min = sessions.items.filter((s) => toInputDate(s.date) === iso).reduce((sum, s) => sum + s.durationMin, 0);
    return { day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], Minutes: min };
  });

  const bySubject = useMemo(() => {
    const map = new Map();
    sessions.items.forEach((s) => {
      const name = subjectMap.get(s.subject)?.name || 'General';
      const color = subjectMap.get(s.subject)?.color || '#ADB8C4';
      const entry = map.get(name) || { name, color, Minutes: 0 };
      entry.Minutes += s.durationMin || 0;
      map.set(name, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.Minutes - a.Minutes);
  }, [sessions.items, subjectMap]);

  const sorted = [...sessions.items].sort((a, b) => new Date(b.date) - new Date(a.date));

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.durationMin) return;
    setBusy(true);
    try {
      const payload = {
        subject: form.subject || null,
        date: form.date,
        startTime: form.startTime,
        durationMin: Number(form.durationMin),
        objectives: form.objectives,
        notes: form.notes,
      };
      if (initial) await sessions.update(initial._id, payload, 'Session updated');
      else await sessions.create(payload, 'Study session logged');
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
      await sessions.remove(confirm.id, 'Session deleted');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Total study hours" value={`${(totalMin / 60).toFixed(1)}h`} accent="#6E8FAE" sub={`${sessions.items.length} sessions logged`} />
        <StatCard icon={Clock} label="This week" value={`${(weekMin / 60).toFixed(1)}h`} accent="#B08A57" sub={`${weekItems.length} sessions`} />
        <StatCard icon={Clock} label="Average session" value={`${avg} min`} accent="#5F8A79" sub="All time" />
        <StatCard
          icon={Clock}
          label="Top subject"
          value={bySubject[0]?.name || '—'}
          accent="#4E7364"
          sub={bySubject[0] ? `${(bySubject[0].Minutes / 60).toFixed(1)}h logged` : 'No sessions yet'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="This week's study" subtitle="Minutes per day" icon={BookOpen} height={250}>
          <BarChart data={dailyChart} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DEE5EC" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip cursor={{ fill: 'rgba(110, 143, 174,0.18)' }} content={<ChartTooltip formatter={(v) => `${v} min`} />} />
            <Bar dataKey="Minutes" fill="#B08A57" radius={[6, 6, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Hours by subject" subtitle="Distribution across courses" icon={BookOpen} height={250}>
          {bySubject.length ? (
            <BarChart data={bySubject.map((s) => ({ ...s, Hours: +(s.Minutes / 60).toFixed(1) }))} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DEE5EC" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5F7186' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip cursor={{ fill: 'rgba(110, 143, 174,0.18)' }} content={<ChartTooltip formatter={(v) => `${v}h`} />} />
              <Bar dataKey="Hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {bySubject.map((s, i) => (
                  <Cell key={s.name} fill={s.color || CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <div className="grid h-full place-items-center text-sm text-taupe-500">Log a session to see the breakdown.</div>
          )}
        </ChartCard>
      </div>

      <Card>
        <CardHeader
          title="Study sessions"
          subtitle="Every focused block you have logged"
          icon={BookOpen}
          action={
            <Button size="sm" icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
              Log session
            </Button>
          }
        />
        <div className="space-y-2 p-4">
          {sorted.length ? (
            sorted.map((s) => {
              const subject = subjectMap.get(s.subject);
              return (
                <div key={s._id} className="group flex items-start gap-3 rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-3">
                  <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: subject?.color || '#ADB8C4' }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-semibold text-espresso-800">{subject?.name || 'General study'}</p>
                      <Badge color="#5F8A79">{s.durationMin} min</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-taupe-500">
                      {formatDate(s.date)}
                      {s.startTime ? ` · ${formatTime(s.startTime)}` : ''}
                      {s.objectives ? ` · ${s.objectives}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() =>
                        setModal({
                          initial: s,
                          form: {
                            subject: s.subject || '',
                            date: toInputDate(s.date),
                            startTime: s.startTime || '',
                            durationMin: s.durationMin,
                            objectives: s.objectives || '',
                            notes: s.notes || '',
                          },
                        })
                      }
                      className="rounded-md p-1.5 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                      aria-label="Edit session"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm({ id: s._id, title: subject?.name || 'this session' })}
                      className="rounded-md p-1.5 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                      aria-label="Delete session"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState icon={BookOpen} title="No study sessions yet" description="Log your first focused session to start tracking hours." />
          )}
        </div>
      </Card>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit study session' : 'Log study session'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Log session'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
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
              <Field label="Duration (minutes)" required>
                <Input type="number" min="1" value={modal.form.durationMin} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, durationMin: e.target.value } }))} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" required>
                <Input type="date" value={modal.form.date} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, date: e.target.value } }))} />
              </Field>
              <Field label="Start time">
                <Input type="time" value={modal.form.startTime} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, startTime: e.target.value } }))} />
              </Field>
            </div>
            <Field label="Objectives">
              <Textarea value={modal.form.objectives} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, objectives: e.target.value } }))} placeholder="What did you aim to cover?" />
            </Field>
            <Field label="Notes">
              <Textarea value={modal.form.notes} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, notes: e.target.value } }))} placeholder="Optional" />
            </Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete session?"
        message={`The session for ${confirm?.title} will be removed from your statistics.`}
      />
    </div>
  );
};

export default StudySessionsPanel;
