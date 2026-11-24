import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  ListChecks,
  PiggyBank,
  Sparkles,
  Timer,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useApiData from '../hooks/useApiData.js';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';
import { CYCLE_PHASE_META, EVENT_CATEGORY_COLORS, PRIORITY_META, ROLE_COLORS } from '../utils/constants.js';
import { formatCurrency, formatDate, formatDateShort, formatTime } from '../utils/format.js';

const ListRow = ({ children, className = '' }) => (
  <div className={`flex items-center gap-3 rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-3 ${className}`}>
    {children}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading, reload } = useApiData('/dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const onQuickDone = () => {
    setRefreshKey((k) => k + 1);
    reload();
  };

  const currency = user?.currency || 'USD';
  const firstName = (user?.name || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Loading your day…" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </>
    );
  }

  const finance = data?.finance || {};
  const tasks = data?.tasks || {};
  const hydration = data?.hydration || {};
  const study = data?.study || {};
  const exercise = data?.exercise || {};
  const deadlines = data?.deadlines || [];
  const events = data?.events || [];
  const cycle = data?.cycle;

  return (
    <div key={refreshKey} className="animate-fade-in">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Here is a calm overview of everything that matters today."
        actions={
          <Link to="/reports">
            <Button variant="outline" icon={ArrowUpRight}>
              Monthly report
            </Button>
          </Link>
        }
      />

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-taupe-600">
          <Sparkles size={15} /> Quick actions
        </h2>
        <QuickActions onDone={onQuickDone} />
      </section>

      <section className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Bank balance"
          value={formatCurrency(finance.bankBalance, currency)}
          sub="Income minus expenses across all time"
          accent="#6E8FAE"
        />
        <StatCard
          icon={PiggyBank}
          label="Piggy savings"
          value={formatCurrency(finance.piggyBalance, currency)}
          sub="Deposits minus withdrawals"
          accent="#5F8A79"
        />
        <StatCard
          icon={ListChecks}
          label="Weekly completion"
          value={`${tasks.completion || 0}%`}
          accent="#B08A57"
          sub={`${tasks.weekDone || 0} of ${tasks.weekTotal || 0} tasks done`}
          footer={<ProgressBar className="mt-3" value={tasks.completion || 0} color="#B08A57" height={6} />}
        />
        <StatCard
          icon={Droplets}
          label="Hydration today"
          value={`${hydration.amount || 0} ml`}
          accent="#769887"
          sub={`Goal ${hydration.goal || 2000} ml · ${hydration.percent || 0}%`}
          footer={<ProgressBar className="mt-3" value={hydration.percent || 0} color="#5F8A79" height={6} />}
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today's tasks & priorities"
            subtitle="Your Covey quadrants for the day"
            icon={ClipboardList}
            action={
              <Link to="/planner" className="text-xs font-semibold text-terracotta-600 hover:underline">
                Open planner
              </Link>
            }
          />
          <div className="space-y-2.5 p-4">
            {tasks.today?.length ? (
              tasks.today.map((task) => {
                const meta = PRIORITY_META[task.priority] || PRIORITY_META.Q2;
                return (
                  <ListRow key={task._id}>
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold"
                      style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                      {meta.short}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-espresso-800">{task.title}</p>
                      <p className="truncate text-xs text-taupe-600">
                        {task.time ? `${formatTime(task.time)} · ` : ''}
                        {task.role}
                      </p>
                    </div>
                    <Badge color={ROLE_COLORS[task.role] || '#9FAEBC'}>{task.status.replace('-', ' ')}</Badge>
                  </ListRow>
                );
              })
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No tasks scheduled today"
                description="Enjoy the open space, or plan something meaningful in your weekly planner."
              />
            )}

            {tasks.overdue?.length > 0 && (
              <div className="rounded-xl border border-terracotta-400/40 bg-terracotta-500/5 px-3.5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">
                  {tasks.overdue.length} overdue task{tasks.overdue.length > 1 ? 's' : ''}
                </p>
                <p className="mt-1 text-xs text-taupe-600">
                  From {formatDate(tasks.overdue[0].date)} — reschedule them in the planner.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="This week at a glance" subtitle="Study & movement" icon={Timer} />
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="rounded-xl border border-sand-200 bg-cream-50 p-3.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-500/15 text-gold-500">
                  <BookOpen size={16} />
                </span>
                <p className="mt-2.5 font-display text-xl font-semibold text-espresso-900">{study.hours || 0}h</p>
                <p className="text-xs text-taupe-600">{study.sessions || 0} study sessions</p>
              </div>
              <div className="rounded-xl border border-sand-200 bg-cream-50 p-3.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-olive-500/15 text-olive-500">
                  <Dumbbell size={16} />
                </span>
                <p className="mt-2.5 font-display text-xl font-semibold text-espresso-900">{exercise.minutes || 0}m</p>
                <p className="text-xs text-taupe-600">
                  {exercise.completed || 0}/{exercise.sessions || 0} workouts done
                </p>
              </div>
            </div>
          </Card>

          {cycle && (
            <Card>
              <CardHeader title="Cycle phase" subtitle="Private & optional" icon={HeartPulse} />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span
                    className="chip"
                    style={{
                      color: CYCLE_PHASE_META[cycle.phase]?.color,
                      backgroundColor: CYCLE_PHASE_META[cycle.phase]?.bg,
                    }}
                  >
                    {cycle.phase}
                  </span>
                  <span className="text-xs text-taupe-600">Day {cycle.cycleDay}</span>
                </div>
                <p className="mt-3 text-xs text-taupe-600">
                  Estimated next period in {cycle.daysUntilNextPeriod} day
                  {cycle.daysUntilNextPeriod === 1 ? '' : 's'}.
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-taupe-500">{cycle.suggestions?.[0]}</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Upcoming academic deadlines"
            subtitle="Synced with your calendar"
            icon={GraduationCap}
            action={
              <Link to="/study" className="text-xs font-semibold text-terracotta-600 hover:underline">
                Study
              </Link>
            }
          />
          <div className="space-y-2.5 p-4">
            {deadlines.length ? (
              deadlines.map((d) => (
                <ListRow key={d._id}>
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: d.subject?.color || '#6E8FAE' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-espresso-800">{d.title}</p>
                    <p className="truncate text-xs text-taupe-600">
                      {d.subject?.name || 'General'} · {d.type}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-taupe-600">{formatDateShort(d.dueDate)}</span>
                </ListRow>
              ))
            ) : (
              <EmptyState icon={GraduationCap} title="No upcoming deadlines" description="You are all caught up." />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Upcoming events"
            subtitle="Next 30 days"
            icon={CalendarDays}
            action={
              <Link to="/calendar" className="text-xs font-semibold text-terracotta-600 hover:underline">
                Calendar
              </Link>
            }
          />
          <div className="space-y-2.5 p-4">
            {events.length ? (
              events.map((ev) => (
                <ListRow key={ev._id}>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: EVENT_CATEGORY_COLORS[ev.category] || '#9FAEBC' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-espresso-800">{ev.title}</p>
                    <p className="truncate text-xs text-taupe-600">
                      {ev.category}
                      {ev.startTime ? ` · ${formatTime(ev.startTime)}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-taupe-600">{formatDateShort(ev.date)}</span>
                </ListRow>
              ))
            ) : (
              <EmptyState icon={CalendarDays} title="Nothing scheduled" description="Your calendar is clear." />
            )}
          </div>
        </Card>
      </section>

      <p className="mt-6 text-center text-xs text-taupe-500">
        Last synced {formatDate(new Date())} · balances and stats are recalculated from your records on every load.
      </p>
    </div>
  );
};

export default Dashboard;
