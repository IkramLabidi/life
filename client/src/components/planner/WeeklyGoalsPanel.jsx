import { useState } from 'react';
import { Check, Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { Input, Select } from '../ui/FormControls.jsx';
import { LIFE_ROLES, ROLE_COLORS } from '../../utils/constants.js';

const WeeklyGoalsPanel = ({ goals, onAdd, onUpdate, onDelete, onToggle, busy }) => {
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('Personal Life');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', role: 'Personal Life' });

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), role });
    setTitle('');
    setRole('Personal Life');
  };

  const startEdit = (goal) => {
    setEditId(goal._id);
    setEditForm({ title: goal.title, role: goal.role });
  };

  const saveEdit = async (id) => {
    if (!editForm.title.trim()) return;
    await onUpdate(id, { title: editForm.title.trim(), role: editForm.role });
    setEditId(null);
  };

  const done = goals.filter((g) => g.completed).length;

  return (
    <Card>
      <CardHeader
        title="Weekly goals"
        subtitle="The few things that would make this week a win"
        icon={Target}
        action={<Badge color="#4E7364">{done}/{goals.length} done</Badge>}
      />
      <div className="p-4">
        <form onSubmit={add} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a weekly goal…"
            className="flex-1"
          />
          <Select value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-52">
            {LIFE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Button type="submit" icon={Plus} variant="accent">
            Add
          </Button>
        </form>

        <div className="space-y-2">
          {goals.length ? (
            goals.map((goal) => (
              <div key={goal._id} className="group flex items-center gap-2.5 rounded-xl border border-sand-200 bg-cream-50 px-3 py-2.5">
                {editId === goal._id ? (
                  <>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      className="flex-1"
                    />
                    <Select
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      className="w-44"
                    >
                      {LIFE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                    <Button size="sm" variant="ghost" onClick={() => saveEdit(goal._id)} loading={busy} aria-label="Save">
                      <Check size={15} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)} aria-label="Cancel">
                      <X size={15} />
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onToggle(goal)}
                      aria-label={goal.completed ? 'Mark as not done' : 'Mark as done'}
                      className={`grid shrink-0 place-items-center rounded-md border transition ${
                        goal.completed ? 'border-olive-500 bg-olive-500 text-cream-50' : 'border-sand-300 hover:border-olive-400'
                      }`}
                      style={{ height: 18, width: 18 }}
                    >
                      {goal.completed && <Check size={12} />}
                    </button>
                    <p className={`flex-1 text-sm font-medium text-espresso-800 ${goal.completed ? 'line-through opacity-60' : ''}`}>
                      {goal.title}
                    </p>
                    <Badge color={ROLE_COLORS[goal.role] || '#9FAEBC'}>{goal.role}</Badge>
                    <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEdit(goal)}
                        className="rounded-md p-1 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                        aria-label="Edit goal"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(goal._id)}
                        className="rounded-md p-1 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                        aria-label="Delete goal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <EmptyState icon={Target} title="No weekly goals yet" description="Add a couple of goals to give the week direction." />
          )}
        </div>
      </div>
    </Card>
  );
};

export default WeeklyGoalsPanel;
