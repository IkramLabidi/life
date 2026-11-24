import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Droplets,
  Dumbbell,
  PiggyBank,
  Printer,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import useApiData from '../hooks/useApiData.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import Badge from '../components/ui/Badge.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import Button from '../components/ui/Button.jsx';
import ChartCard, { ChartTooltip } from '../components/charts/Charts.jsx';
import { CATEGORY_META } from '../utils/constants.js';
import { currentMonthKey, formatCurrency, formatMonthLabel, formatNumber } from '../utils/format.js';

const SummaryTile = ({ icon: Icon, label, primary, secondary, accent = '#6E8FAE', children }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-taupe-600">{label}</p>
      <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: `${accent}1f`, color: accent }}>
        <Icon size={16} />
      </span>
    </div>
    <p className="mt-2.5 font-display text-xl font-semibold text-espresso-900">{primary}</p>
    {secondary && <p className="text-xs text-taupe-600">{secondary}</p>}
    {children}
  </Card>
);

const Reports = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonthKey());
  const { data, loading } = useApiData('/reports/monthly', { month });
  const currency = user?.currency || 'USD';

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Monthly report" subtitle="Loading your summary…" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </>
    );
  }

  const finance = data?.finance || {};
  const tasks = data?.tasks || {};
  const study = data?.study || {};
  const exercise = data?.exercise || {};
  const hydration = data?.hydration || {};
  const deadlines = data?.deadlines || { total: 0 };
  const byCategory = (finance.byCategory || []).map((c) => ({
    ...c,
    label: CATEGORY_META[c.category]?.label || c.category,
    color: CATEGORY_META[c.category]?.color || '#9FAEBC',
  }));

  const netPositive = (finance.net || 0) >= 0;
  const financeBars = [
    { name: 'Income', value: finance.income || 0, color: '#5F8A79' },
    { name: 'Expenses', value: finance.expenses || 0, color: '#6E8FAE' },
    { name: 'Net', value: finance.net || 0, color: netPositive ? '#4E7364' : '#587A9B' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Monthly report"
        subtitle={`A single view of your money, tasks, study, movement and hydration for ${formatMonthLabel(month)}.`}
        actions={
          <>
            <input
              type="month"
              value={month}
              max={currentMonthKey()}
              onChange={(e) => setMonth(e.target.value || currentMonthKey())}
              className="input w-auto"
            />
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
          </>
        }
      />

      {/* Finance headline */}
      <section className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ArrowUpRight}
          label="Income"
          value={formatCurrency(finance.income, currency)}
          sub="Money added this month"
          accent="#5F8A79"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Expenses"
          value={formatCurrency(finance.expenses, currency)}
          sub={byCategory.length ? `${byCategory.length} spending categories` : 'No expenses logged'}
          accent="#6E8FAE"
        />
        <StatCard
          icon={TrendingUp}
          label="Net balance"
          value={formatCurrency(finance.net, currency)}
          sub={netPositive ? 'You are in the green' : 'Spending exceeded income'}
          accent={netPositive ? '#4E7364' : '#587A9B'}
        />
        <StatCard
          icon={PiggyBank}
          label="Piggy net change"
          value={formatCurrency(finance.savingsNet, currency)}
          sub={`${formatCurrency(finance.deposits, currency)} in · ${formatCurrency(finance.withdrawals, currency)} out`}
          accent="#B08A57"
        />
      </section>

      {/* Finance charts */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Income vs expenses" subtitle="Where the month landed" icon={Wallet} height={280}>
          <BarChart data={financeBars} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#EFE6D6" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#5F7186' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#5F7186' }} width={64} />
            <Tooltip
              cursor={{ fill: 'rgba(176, 138, 87,0.08)' }}
              content={<ChartTooltip formatter={(v) => formatCurrency(v, currency)} />}
            />
            <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]} maxBarSize={72}>
              {financeBars.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Spending by category" subtitle="Where your money went" icon={TrendingUp} height={280}>
          {byCategory.length ? (
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={90}
                paddingAngle={2}
              >
                {byCategory.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v, currency)} />} />
            </PieChart>
          ) : (
            <div className="grid h-full place-items-center text-sm text-taupe-500">No expenses recorded this month.</div>
          )}
        </ChartCard>
      </section>

      {/* Cross-module summary */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={ClipboardCheck}
          label="Tasks completed"
          accent="#B08A57"
          primary={`${tasks.completion || 0}%`}
          secondary={`${tasks.completed || 0} of ${tasks.total || 0} tasks`}
        >
          <ProgressBar className="mt-3" value={tasks.completion || 0} color="#B08A57" height={6} />
        </SummaryTile>

        <SummaryTile
          icon={BookOpen}
          label="Study time"
          accent="#6E8FAE"
          primary={`${study.hours || 0} h`}
          secondary={`${study.sessions || 0} sessions · ${formatNumber(study.minutes)} min`}
        />

        <SummaryTile
          icon={Dumbbell}
          label="Exercise"
          accent="#5F8A79"
          primary={`${formatNumber(exercise.minutes)} min`}
          secondary={`${exercise.completed || 0}/${exercise.sessions || 0} workouts completed`}
        />

        <SummaryTile
          icon={Droplets}
          label="Hydration"
          accent="#769887"
          primary={`${formatNumber(hydration.totalMl)} ml`}
          secondary={`${hydration.daysLogged || 0} days logged · avg ${formatNumber(hydration.avgPerDay)} ml/day`}
        />
      </section>

      {/* Detail table */}
      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Category breakdown" subtitle="Expense totals for the month" icon={Wallet} />
          <div className="p-4">
            {byCategory.length ? (
              <div className="space-y-3">
                {byCategory.map((row) => {
                  const share = finance.expenses ? Math.round((row.total / finance.expenses) * 100) : 0;
                  return (
                    <div key={row.category} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="w-32 shrink-0 truncate text-sm font-medium text-espresso-800">{row.label}</span>
                      <div className="min-w-0 flex-1">
                        <ProgressBar value={share} color={row.color} height={6} />
                      </div>
                      <span className="w-24 shrink-0 text-right text-sm font-semibold text-espresso-800">
                        {formatCurrency(row.total, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-taupe-500">No expenses recorded for this month.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Academic deadlines" subtitle="Due this month" icon={CalendarClock} />
          <div className="p-5">
            <p className="font-display text-4xl font-semibold text-espresso-900">{deadlines.total || 0}</p>
            <p className="mt-1 text-xs text-taupe-600">
              {deadlines.total === 1 ? 'deadline falls' : 'deadlines fall'} within {formatMonthLabel(month)}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge color="#6E8FAE">Study</Badge>
              <Badge color="#9FAEBC">Calendar synced</Badge>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-taupe-500">
              Academic deadlines are linked to matching calendar events so they never appear twice.
            </p>
          </div>
        </Card>
      </section>

      <p className="mt-6 text-center text-xs text-taupe-500">
        All figures are recalculated from your stored records each time this report is opened.
      </p>
    </div>
  );
};

export default Reports;
