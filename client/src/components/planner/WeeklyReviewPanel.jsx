import { useEffect, useState } from 'react';
import { NotebookPen, Star } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { Field, Textarea } from '../ui/FormControls.jsx';

const WeeklyReviewPanel = ({ review, onSave, saving }) => {
  const [form, setForm] = useState({ wins: '', challenges: '', rating: 3, notes: '' });

  useEffect(() => {
    if (review) {
      setForm({
        wins: review.wins || '',
        challenges: review.challenges || '',
        rating: review.rating || 3,
        notes: review.notes || '',
      });
    }
  }, [review]);

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Card>
      <CardHeader
        title="Weekly review"
        subtitle="Sharpen the saw — reflect before the next week begins"
        icon={NotebookPen}
      />
      <form
        className="space-y-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <Field label="Wins this week">
          <Textarea value={form.wins} onChange={change('wins')} placeholder="What went well?" rows={3} />
        </Field>
        <Field label="Challenges">
          <Textarea value={form.challenges} onChange={change('challenges')} placeholder="What was difficult?" rows={3} />
        </Field>
        <Field label="How would you rate the week?">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: n }))}
                aria-label={`Rate ${n} of 5`}
                className="rounded-lg p-1 transition hover:bg-sand-100"
              >
                <Star
                  size={22}
                  className={n <= form.rating ? 'text-gold-500' : 'text-sand-300'}
                  fill={n <= form.rating ? '#B08A57' : 'none'}
                />
              </button>
            ))}
            <span className="ml-1 text-sm text-taupe-600">{form.rating}/5</span>
          </div>
        </Field>
        <Field label="Notes for next week">
          <Textarea value={form.notes} onChange={change('notes')} placeholder="One adjustment to carry forward…" rows={3} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save review
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WeeklyReviewPanel;
