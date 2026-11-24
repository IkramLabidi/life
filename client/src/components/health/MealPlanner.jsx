import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormControls.jsx';
import useCollection from '../../hooks/useCollection.js';
import { MEAL_TYPES } from '../../utils/constants.js';
import { addDays, formatDate, startOfWeek, toInputDate, todayISO } from '../../utils/format.js';

const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' };

const empty = (date, mealType) => ({ date, mealType, name: '', ingredients: '', notes: '', consumed: false });

const MealPlanner = () => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekISO = days.map(toInputDate);

  const meals = useCollection('/meals');
  const [modal, setModal] = useState(null); // { initial, form }
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const weekMeals = meals.items.filter((m) => weekISO.includes(toInputDate(m.date)));

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const payload = {
        date: form.date,
        mealType: form.mealType,
        name: form.name.trim(),
        ingredients: form.ingredients,
        notes: form.notes,
        consumed: form.consumed,
      };
      if (initial) await meals.update(initial._id, payload, 'Meal updated');
      else await meals.create(payload, 'Meal added');
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
      await meals.remove(confirm.id, 'Meal removed');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const toggleConsumed = (meal) => meals.update(meal._id, { consumed: !meal.consumed }, !meal.consumed ? 'Marked as eaten' : 'Marked as planned');

  const consumedCount = weekMeals.filter((m) => m.consumed).length;

  return (
    <Card>
      <CardHeader
        title="Weekly meal planner"
        subtitle="Plan meals and tick off what you actually eat"
        icon={UtensilsCrossed}
        action={
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-taupe-500 sm:inline">{consumedCount}/{weekMeals.length} eaten</span>
            <div className="flex items-center gap-1 rounded-lg border border-sand-200 bg-cream-50 p-0.5">
              <button
                type="button"
                onClick={() => setWeekStart((w) => addDays(w, -7))}
                className="rounded-md p-1 text-taupe-500 hover:bg-sand-100"
                aria-label="Previous week"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(startOfWeek())}
                className="rounded-md px-2 py-1 text-[11px] font-semibold text-espresso-700 hover:bg-sand-100"
              >
                This week
              </button>
              <button
                type="button"
                onClick={() => setWeekStart((w) => addDays(w, 7))}
                className="rounded-md p-1 text-taupe-500 hover:bg-sand-100"
                aria-label="Next week"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        }
      />
      <div className="p-4">
        <p className="mb-3 text-xs text-taupe-500">{`${formatDate(days[0])} – ${formatDate(days[6])}`}</p>
        <div className="overflow-x-auto scroll-thin">
          <div className="min-w-[900px]">
            <div className="grid" style={{ gridTemplateColumns: '96px repeat(7, minmax(0,1fr))' }}>
              <div />
              {days.map((d, i) => {
                const isToday = toInputDate(d) === todayISO();
                return (
                  <div key={i} className={`px-1.5 pb-2 text-center ${isToday ? 'text-terracotta-600' : 'text-taupe-600'}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wide">{WEEKDAY[i]}</p>
                    <p className="text-[10px]">{d.getDate()}</p>
                  </div>
                );
              })}

              {MEAL_TYPES.map((type) => (
                <div key={type} className="contents">
                  <div className="flex items-start border-t border-sand-200 py-3 pr-2 text-xs font-semibold text-espresso-700">
                    {MEAL_LABELS[type]}
                  </div>
                  {days.map((d, i) => {
                    const key = toInputDate(d);
                    const cellMeals = weekMeals.filter((m) => toInputDate(m.date) === key && m.mealType === type);
                    return (
                      <div key={`${type}-${i}`} className="border-t border-sand-200 p-1.5">
                        <div className="space-y-1.5">
                          {cellMeals.map((meal) => (
                            <div key={meal._id} className="group rounded-lg border border-sand-200 bg-cream-50 p-2">
                              <div className="flex items-start gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleConsumed(meal)}
                                  className={`mt-0.5 grid shrink-0 place-items-center rounded border transition ${
                                    meal.consumed ? 'border-olive-500 bg-olive-500 text-cream-50' : 'border-sand-300 hover:border-olive-400'
                                  }`}
                                  style={{ height: 16, width: 16 }}
                                  aria-label={meal.consumed ? 'Mark as planned' : 'Mark as eaten'}
                                >
                                  {meal.consumed && <Check size={10} />}
                                </button>
                                <p className={`flex-1 text-[11px] font-semibold leading-snug text-espresso-800 ${meal.consumed ? '' : 'opacity-90'}`}>
                                  {meal.name}
                                </p>
                              </div>
                              {meal.ingredients && (
                                <p className="mt-1 line-clamp-2 text-[10px] text-taupe-500">{meal.ingredients}</p>
                              )}
                              <div className="mt-1 flex justify-end gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModal({
                                      initial: meal,
                                      form: {
                                        date: toInputDate(meal.date),
                                        mealType: meal.mealType,
                                        name: meal.name,
                                        ingredients: meal.ingredients || '',
                                        notes: meal.notes || '',
                                        consumed: meal.consumed,
                                      },
                                    })
                                  }
                                  className="rounded p-0.5 text-taupe-400 hover:text-espresso-700"
                                  aria-label="Edit meal"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirm({ id: meal._id, title: meal.name })}
                                  className="rounded p-0.5 text-taupe-400 hover:text-terracotta-600"
                                  aria-label="Delete meal"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setModal({ initial: null, form: empty(key, type) })}
                            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-sand-300 py-1 text-[10px] font-medium text-taupe-400 transition hover:border-terracotta-400 hover:text-terracotta-600"
                          >
                            <Plus size={11} /> Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!weekMeals.length && (
          <div className="mt-4">
            <EmptyState
              icon={UtensilsCrossed}
              title="No meals planned this week"
              description="Use the Add buttons in the grid to plan your breakfast, lunch, dinner and snacks."
            />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit meal' : 'Add meal'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Add meal'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Meal name" required>
              <Input
                value={modal.form.name}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))}
                placeholder="e.g. Oatmeal with berries"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" required>
                <Input
                  type="date"
                  value={modal.form.date}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, date: e.target.value } }))}
                />
              </Field>
              <Field label="Meal type" required>
                <Select
                  value={modal.form.mealType}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, mealType: e.target.value } }))}
                >
                  {MEAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {MEAL_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Ingredients">
              <Input
                value={modal.form.ingredients}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, ingredients: e.target.value } }))}
                placeholder="Oats, milk, blueberries"
              />
            </Field>
            <Field label="Notes">
              <Textarea
                value={modal.form.notes}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, notes: e.target.value } }))}
                placeholder="Optional"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-espresso-700">
              <input
                type="checkbox"
                checked={modal.form.consumed}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, consumed: e.target.checked } }))}
                className="h-4 w-4 rounded border-sand-300 text-olive-500 focus:ring-olive-400"
              />
              I already ate this
            </label>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Remove meal?"
        message={`“${confirm?.title}” will be removed from your plan.`}
      />
    </Card>
  );
};

export default MealPlanner;
