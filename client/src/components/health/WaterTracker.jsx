import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { Droplets, RotateCcw, Target } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import StatCard from '../ui/StatCard.jsx';
import Button from '../ui/Button.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { Field, Input } from '../ui/FormControls.jsx';
import ChartCard, { ChartTooltip } from '../charts/Charts.jsx';
import api, { getErrorMessage } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { addDays, formatDateShort, startOfWeek, toInputDate, todayISO } from '../../utils/format.js';

const QUICK = [250, 500, 750];

const WaterTracker = () => {
  const toast = useToast();
  const today = todayISO();
  const weekStart = useMemo(() => startOfWeek(), []);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const [log, setLog] = useState(null);
  const [week, setWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, weekRes] = await Promise.all([
        api.get('/water', { params: { date: today } }),
        api.get('/water', { params: { from: toInputDate(weekStart), to: toInputDate(weekEnd) } }),
      ]);
      setLog(todayRes.data);
      setWeek(Array.isArray(weekRes.data) ? weekRes.data : []);
      setGoalInput(String(todayRes.data?.goal ?? 2000));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [today, weekStart, weekEnd, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (payload, message) => {
    setBusy(true);
    try {
      await api.post('/water', { date: today, ...payload });
      await load();
      if (message) toast.success(message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!log?._id) return;
    setBusy(true);
    try {
      await api.delete(`/water/${log._id}`);
      await load();
      toast.success('Today’s intake reset');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const amount = log?.amount || 0;
  const goal = log?.goal || 2000;
  const percent = goal ? Math.min(100, Math.round((amount / goal) * 100)) : 0;

  const chartData = useMemo(() => {
    const byDate = new Map(week.map((w) => [toInputDate(w.date), w.amount]));
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      const key = toInputDate(d);
      return { day: `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}`, amount: byDate.get(key) || 0, today: key === today };
    });
  }, [week, weekStart, today]);

  const weekTotal = week.reduce((sum, w) => sum + (w.amount || 0), 0);

  if (loading && !log) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64 lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Today's hydration" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} icon={Droplets} />
          <div className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-3xl font-semibold text-espresso-900">
                  {amount}
                  <span className="text-base text-taupe-500"> / {goal} ml</span>
                </p>
                <p className="mt-0.5 text-xs text-taupe-500">{percent}% of your daily goal</p>
              </div>
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ backgroundColor: 'rgba(95, 138, 121,0.15)', color: '#5F8A79' }}
              >
                <Droplets size={20} />
              </span>
            </div>
            <ProgressBar className="mt-3" value={percent} color="#5F8A79" height={10} />

            <div className="mt-4 grid grid-cols-3 gap-2">
              {QUICK.map((q) => (
                <Button key={q} variant="outline" size="sm" disabled={busy} onClick={() => post({ add: q }, `Added ${q} ml`)}>
                  +{q}
                </Button>
              ))}
            </div>

            <div className="mt-4 flex items-end gap-2">
              <Field label="Custom amount (ml)" className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 300"
                />
              </Field>
              <Button
                variant="accent"
                disabled={busy || !customAmount}
                onClick={() => {
                  post({ add: Number(customAmount) }, `Added ${customAmount} ml`);
                  setCustomAmount('');
                }}
              >
                Add
              </Button>
            </div>

            <div className="mt-4 flex items-end gap-2 border-t border-sand-200 pt-4">
              <Field label="Daily goal (ml)" className="flex-1">
                <Input type="number" min="0" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} />
              </Field>
              <Button icon={Target} variant="outline" disabled={busy} onClick={() => post({ goal: Number(goalInput) }, 'Goal updated')}>
                Set
              </Button>
            </div>

            {log?._id && (
              <Button className="mt-3 w-full" variant="ghost" icon={RotateCcw} disabled={busy} onClick={reset}>
                Reset today
              </Button>
            )}
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard icon={Droplets} label="This week" value={`${weekTotal} ml`} accent="#5F8A79" sub={`${week.length} day(s) logged`} />
            <StatCard
              icon={Target}
              label="Daily average"
              value={`${week.length ? Math.round(weekTotal / week.length) : 0} ml`}
              accent="#B08A57"
              sub={`Goal ${goal} ml per day`}
            />
          </div>

          <ChartCard title="Weekly hydration history" subtitle="Millilitres per day" icon={Droplets} height={260}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DEE5EC" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip cursor={{ fill: 'rgba(110, 143, 174,0.18)' }} content={<ChartTooltip formatter={(v) => `${v} ml`} />} />
              <ReferenceLine y={goal} stroke="#6E8FAE" strokeDasharray="4 4" />
              <Bar dataKey="amount" name="Intake" radius={[6, 6, 0, 0]} maxBarSize={34}>
                {chartData.map((d) => (
                  <Cell key={d.day} fill={d.amount >= goal ? '#5F8A79' : d.today ? '#B08A57' : '#C9D4DE'} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </div>
      </div>

      <p className="text-center text-xs text-taupe-500">
        Last refreshed {formatDateShort(new Date())}. Hydration needs vary by person, activity and climate.
      </p>
    </div>
  );
};

export default WaterTracker;
