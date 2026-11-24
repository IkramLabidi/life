import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Info, Pencil, Plus, Ruler, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import StatCard from '../ui/StatCard.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Field, Input, Textarea } from '../ui/FormControls.jsx';
import ChartCard, { ChartTooltip } from '../charts/Charts.jsx';
import useCollection from '../../hooks/useCollection.js';
import { formatDate, toInputDate, todayISO } from '../../utils/format.js';

const bmiCategory = (bmi) => {
  if (!bmi) return { label: '—', color: '#9FAEBC' };
  if (bmi < 18.5) return { label: 'Below range', color: '#B08A57' };
  if (bmi < 25) return { label: 'Within range', color: '#4E7364' };
  if (bmi < 30) return { label: 'Above range', color: '#8AA6C1' };
  return { label: 'Well above range', color: '#587A9B' };
};

const empty = () => ({ date: todayISO(), weightKg: '', heightCm: '', notes: '' });

const MeasurementsTracker = () => {
  const measurements = useCollection('/measurements');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () => [...measurements.items].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [measurements.items]
  );
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const bmiValue = latest?.bmi;
  const cat = bmiCategory(bmiValue);
  const weightChange = latest && first ? (latest.weightKg - first.weightKg) : 0;

  const chartData = sorted.map((m) => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Weight: m.weightKg,
    BMI: m.bmi,
  }));

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.weightKg || !form.heightCm) return;
    setBusy(true);
    try {
      const payload = {
        date: form.date,
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
        notes: form.notes,
      };
      if (initial) await measurements.update(initial._id, payload, 'Measurement updated');
      else await measurements.create(payload, 'Measurement recorded');
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
      await measurements.remove(confirm.id, 'Measurement deleted');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Latest weight" value={latest ? `${latest.weightKg} kg` : '—'} accent="#6E8FAE" sub={latest ? formatDate(latest.date) : 'No records yet'} />
        <StatCard icon={Ruler} label="Height" value={latest ? `${latest.heightCm} cm` : '—'} accent="#5F8A79" sub="Used for BMI" />
        <StatCard icon={Activity} label="BMI" value={bmiValue ? bmiValue.toFixed(1) : '—'} accent={cat.color} sub={bmiValue ? cat.label : 'Add a measurement'} />
        <StatCard
          icon={Activity}
          label="Change"
          value={`${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`}
          accent="#B08A57"
          sub="Since first record"
        />
      </div>

      <ChartCard title="Weight progress" subtitle="Monthly measurements" icon={Activity} height={280} className="mt-0">
        {chartData.length ? (
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DEE5EC" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v} kg`} />} />
            <Line type="monotone" dataKey="Weight" stroke="#6E8FAE" strokeWidth={2.5} dot={{ r: 4, fill: '#6E8FAE' }} activeDot={{ r: 6 }} />
          </LineChart>
        ) : (
          <div className="grid h-full place-items-center text-sm text-taupe-500">No measurements recorded yet.</div>
        )}
      </ChartCard>

      <Card>
        <CardHeader
          title="Measurement history"
          subtitle="Weight, height and BMI"
          icon={Ruler}
          action={
            <Button size="sm" icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
              Add measurement
            </Button>
          }
        />
        <div className="flex items-start gap-2.5 border-b border-sand-200 bg-sand-100/50 px-5 py-3 text-xs text-taupe-600">
          <Info size={15} className="mt-0.5 shrink-0 text-gold-500" />
          <p>
            BMI is a general <strong>adult screening measure, not a diagnosis</strong>. It does not account for muscle
            mass, body composition, age or health conditions — use it alongside professional advice.
          </p>
        </div>
        {sorted.length ? (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-taupe-500">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Weight</th>
                  <th className="px-5 py-3 font-semibold">Height</th>
                  <th className="px-5 py-3 font-semibold">BMI</th>
                  <th className="px-5 py-3 font-semibold">Notes</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((m) => {
                  const c = bmiCategory(m.bmi);
                  return (
                    <tr key={m._id} className="border-t border-sand-200">
                      <td className="whitespace-nowrap px-5 py-3 text-taupe-600">{formatDate(m.date)}</td>
                      <td className="px-5 py-3 font-semibold text-espresso-800">{m.weightKg} kg</td>
                      <td className="px-5 py-3 text-taupe-600">{m.heightCm} cm</td>
                      <td className="px-5 py-3">
                        <Badge color={c.color}>{m.bmi ? m.bmi.toFixed(1) : '—'}</Badge>
                      </td>
                      <td className="px-5 py-3 text-taupe-600">{m.notes || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setModal({
                                initial: m,
                                form: { date: toInputDate(m.date), weightKg: m.weightKg, heightCm: m.heightCm, notes: m.notes || '' },
                              })
                            }
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-terracotta-600" onClick={() => setConfirm({ id: m._id, title: formatDate(m.date) })}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Ruler}
              title="No measurements yet"
              description="Record your weight and height to track BMI and progress over time."
              action={
                <Button icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
                  Add measurement
                </Button>
              }
            />
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit measurement' : 'Add measurement'}
        subtitle="BMI is calculated automatically for you."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Record'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Date" required>
              <Input type="date" value={modal.form.date} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, date: e.target.value } }))} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Weight (kg)" required>
                <Input type="number" step="0.1" min="0" value={modal.form.weightKg} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, weightKg: e.target.value } }))} placeholder="e.g. 70.2" />
              </Field>
              <Field label="Height (cm)" required>
                <Input type="number" step="0.1" min="0" value={modal.form.heightCm} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, heightCm: e.target.value } }))} placeholder="e.g. 174" />
              </Field>
            </div>
            {modal.form.weightKg && modal.form.heightCm && (
              <p className="rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-sm text-taupe-600">
                Estimated BMI:{' '}
                <strong className="text-espresso-800">
                  {(Number(modal.form.weightKg) / (Number(modal.form.heightCm) / 100) ** 2).toFixed(1)}
                </strong>{' '}
                · screening measure only
              </p>
            )}
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
        title="Delete measurement?"
        message={`The record from ${confirm?.title} will be permanently removed.`}
      />
    </div>
  );
};

export default MeasurementsTracker;
