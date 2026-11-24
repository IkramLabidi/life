import { useEffect, useMemo, useState } from 'react';
import { BookOpen, NotebookPen, Save, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { Field, Input, Textarea } from '../components/ui/FormControls.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import useCollection from '../hooks/useCollection.js';
import { MOODS, MOOD_META } from '../utils/constants.js';
import { formatDate, toInputDate, todayISO } from '../utils/format.js';

const emptyForm = () => ({ reflections: '', achievements: '', mood: 'okay', notes: '' });

const Journal = () => {
  const toast = useToast();
  const journal = useCollection('/journal');
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const sorted = useMemo(
    () => [...journal.items].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [journal.items]
  );
  const currentEntry = sorted.find((e) => toInputDate(e.date) === date);

  useEffect(() => {
    if (currentEntry) {
      setForm({
        reflections: currentEntry.reflections || '',
        achievements: currentEntry.achievements || '',
        mood: currentEntry.mood || 'okay',
        notes: currentEntry.notes || '',
      });
    } else {
      setForm(emptyForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, currentEntry?._id]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/journal', { date, ...form });
      toast.success(currentEntry ? 'Journal entry updated' : 'Journal entry saved');
      await journal.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await journal.remove(confirm.id, 'Journal entry deleted');
      setConfirm(null);
      if (toInputDate(confirm.date) === date) setForm(emptyForm());
    } finally {
      setBusy(false);
    }
  };

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Daily journal"
        subtitle="A few quiet lines each day — reflections, wins and how you felt."
        actions={
          <Button variant="outline" onClick={() => setDate(todayISO())}>
            Today
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader
            title={currentEntry ? 'Edit entry' : 'New entry'}
            subtitle={formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            icon={NotebookPen}
          />
          <form onSubmit={save} className="space-y-4 p-5">
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-56" />
            </Field>

            <Field label="Mood">
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, mood: m }))}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      form.mood === m ? 'text-cream-50' : 'text-taupe-600 hover:bg-sand-100'
                    }`}
                    style={form.mood === m ? { backgroundColor: MOOD_META[m].color, borderColor: MOOD_META[m].color } : { borderColor: '#DEE5EC' }}
                  >
                    <span>{MOOD_META[m].emoji}</span>
                    {MOOD_META[m].label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Reflections">
              <Textarea value={form.reflections} onChange={change('reflections')} rows={3} placeholder="What is on your mind today?" />
            </Field>
            <Field label="Achievements">
              <Textarea value={form.achievements} onChange={change('achievements')} rows={3} placeholder="What went well? What are you proud of?" />
            </Field>
            <Field label="Notes">
              <Textarea value={form.notes} onChange={change('notes')} rows={2} placeholder="Anything else — gratitude, ideas, reminders." />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" icon={Save} loading={busy}>
                {currentEntry ? 'Save changes' : 'Save entry'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Recent entries" subtitle={`${sorted.length} total`} icon={BookOpen} />
          <div className="space-y-2 p-4">
            {sorted.length ? (
              sorted.slice(0, 12).map((entry) => (
                <div
                  key={entry._id}
                  className={`group flex items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
                    toInputDate(entry.date) === date ? 'border-terracotta-400/50 bg-terracotta-500/5' : 'border-sand-200 bg-cream-50'
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg" style={{ backgroundColor: `${MOOD_META[entry.mood].color}1f` }}>
                    {MOOD_META[entry.mood].emoji}
                  </span>
                  <button type="button" onClick={() => setDate(toInputDate(entry.date))} className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold text-espresso-800">{formatDate(entry.date, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="line-clamp-2 text-xs text-taupe-500">
                      {entry.reflections || entry.achievements || 'No notes'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm({ id: entry._id, date: entry.date, title: formatDate(entry.date) })}
                    className="rounded-md p-1.5 text-taupe-400 opacity-0 transition hover:bg-terracotta-500/10 hover:text-terracotta-600 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <EmptyState icon={NotebookPen} title="No journal entries yet" description="Write your first entry using the form." />
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete entry?"
        message={`Your journal entry for ${confirm?.title} will be permanently deleted.`}
      />
    </div>
  );
};

export default Journal;
