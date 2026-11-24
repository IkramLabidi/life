import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Activity,
  BookMarked,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  ListTodo,
  Timer,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ChartCard, { ChartTooltip } from '../components/charts/Charts.jsx';
import SubjectsPanel from '../components/study/SubjectsPanel.jsx';
import StudyTasksPanel from '../components/study/StudyTasksPanel.jsx';
import DeadlinesPanel from '../components/study/DeadlinesPanel.jsx';
import StudySessionsPanel from '../components/study/StudySessionsPanel.jsx';
import useCollection from '../hooks/useCollection.js';
import { addDays, formatDate, startOfWeek, toInputDate, todayISO } from '../utils/format.js';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'subjects', label: 'Subjects' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'deadlines', label: 'Deadlines' },
  { value: 'sessions', label: 'Sessions' },
];

const Study = () => {
  const [tab, setTab] = useState('overview');
  const sessions = useCollection('/study-sessions');
  const tasks = useCollection('/study-tasks');
  const deadlines = useCollection('/deadlines');

  const today = todayISO();
  const weekStart = useMemo(() => startOfWeek(), []);
  const weekISO = Array.from({ length: 7 }, (_, i) => toInputDate(addDays(weekStart, i)));

  const totalMin = sessions.items.reduce((s, x) => s + (x.durationMin || 0), 0);
  const weekMin = sessions.items.filter((s) => weekISO.includes(toInputDate(s.date))).reduce((s, x) => s + x.durationMin, 0);
  const completedTasks = tasks.items.filter((t) => t.completed).length;
  const overdue = tasks.items.filter((t) => !t.completed && t.deadline && toInputDate(t.deadline) < today);
  const upcoming = [...deadlines.items]
    .filter((d) => toInputDate(d.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const dailyChart = weekISO.map((iso, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    Minutes: sessions.items.filter((s) => toInputDate(s.date) === iso).reduce((sum, s) => sum + s.durationMin, 0),
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Study tracker"
        subtitle="Subjects, tasks, deadlines and focused sessions — all in one place."
        actions={<SegmentedControl options={TABS} value={tab} onChange={setTab} className="flex-wrap" />}
      />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Timer} label="Total study hours" value={`${(totalMin / 60).toFixed(1)}h`} accent="#6E8FAE" sub={`${(weekMin / 60).toFixed(1)}h this week`} />
            <StatCard icon={CheckCircle2} label="Tasks completed" value={`${completedTasks}/${tasks.items.length}`} accent="#4E7364" sub="Study tasks" />
            <StatCard icon={CalendarClock} label="Upcoming deadlines" value={`${upcoming.length}`} accent="#B08A57" sub="Ahead of you" />
            <StatCard icon={Activity} label="Overdue tasks" value={`${overdue.length}`} accent="#587A9B" sub={overdue.length ? 'Needs attention' : 'All caught up'} />
          </div>

          <ChartCard title="Weekly study minutes" subtitle="Monday to Sunday" icon={BookOpen} height={240}>
            <BarChart data={dailyChart} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DEE5EC" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip cursor={{ fill: 'rgba(110, 143, 174,0.18)' }} content={<ChartTooltip formatter={(v) => `${v} min`} />} />
              <Bar dataKey="Minutes" fill="#6E8FAE" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Upcoming deadlines" subtitle="Next academic milestones" icon={CalendarClock} />
              <div className="space-y-2 p-4">
                {upcoming.length ? (
                  upcoming.slice(0, 6).map((d) => (
                    <div key={d._id} className="flex items-center gap-3 rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-3">
                      <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: d.subject?.color || '#B08A57' }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-espresso-800">{d.title}</p>
                        <p className="text-xs text-taupe-500">{d.subject?.name || 'General'} · {d.type}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-taupe-600">{formatDate(d.dueDate)}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={CalendarClock} title="No upcoming deadlines" description="Enjoy the calm." />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Overdue tasks" subtitle="Reschedule or complete these" icon={ListTodo} />
              <div className="space-y-2 p-4">
                {overdue.length ? (
                  overdue.map((t) => (
                    <div key={t._id} className="flex items-center gap-3 rounded-xl border border-terracotta-400/30 bg-terracotta-500/5 px-3.5 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-terracotta-500/15 text-terracotta-600">
                        <ClipboardList size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-espresso-800">{t.title}</p>
                        <p className="text-xs text-taupe-600">Was due {formatDate(t.deadline)}</p>
                      </div>
                      <Badge color="#587A9B">{t.priority}</Badge>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={CheckCircle2} title="No overdue tasks" description="You are on top of everything." />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'subjects' && <SubjectsPanel />}
      {tab === 'tasks' && <StudyTasksPanel />}
      {tab === 'deadlines' && <DeadlinesPanel />}
      {tab === 'sessions' && <StudySessionsPanel />}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-taupe-500">
        <GraduationCap size={14} />
        <span>Academic deadlines automatically appear on your personal calendar — no duplicates.</span>
        <BookMarked size={14} className="hidden sm:inline" />
      </div>
    </div>
  );
};

export default Study;
