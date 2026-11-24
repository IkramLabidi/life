import { Check, Pencil, Trash2 } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { PRIORITY_META, TASK_PRIORITIES } from '../../utils/constants.js';
import { formatDateShort, formatTime } from '../../utils/format.js';

const QUADRANT_HINT = {
  Q1: 'Crises, pressing problems, deadlines',
  Q2: 'Planning, growth, prevention — the heart of effectiveness',
  Q3: 'Interruptions, some calls, some meetings',
  Q4: 'Busywork, time wasters',
};

const QuadrantBoard = ({ tasks, onEdit, onToggle, onDelete }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {TASK_PRIORITIES.map((q) => {
      const meta = PRIORITY_META[q];
      const items = tasks
        .filter((t) => t.priority === q)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      return (
        <Card key={q} className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ backgroundColor: meta.bg }}>
            <div>
              <p className="font-display text-base font-semibold" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <p className="mt-0.5 text-xs text-taupe-600">{QUADRANT_HINT[q]}</p>
            </div>
            <Badge color={meta.color} bg="rgba(255,255,255,0.6)">
              {items.length}
            </Badge>
          </div>
          <div className="space-y-2 p-4">
            {items.length ? (
              items.map((task) => (
                <div
                  key={task._id}
                  className={`group flex items-start gap-2.5 rounded-xl border border-sand-200 bg-cream-50 px-3 py-2.5 ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggle(task)}
                    aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                    className={`mt-0.5 grid shrink-0 place-items-center rounded-md border transition ${
                      task.completed ? 'border-olive-500 bg-olive-500 text-cream-50' : 'border-sand-300 hover:border-olive-400'
                    }`}
                    style={{ height: 18, width: 18 }}
                  >
                    {task.completed && <Check size={12} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold text-espresso-800 ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <p className="truncate text-xs text-taupe-500">
                      {formatDateShort(task.date)}
                      {task.time ? ` · ${formatTime(task.time)}` : ''} · {task.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="rounded-md p-1 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                      aria-label="Edit task"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      className="rounded-md p-1 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                      aria-label="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Nothing here" description="No tasks in this quadrant for the selected week." />
            )}
          </div>
        </Card>
      );
    })}
  </div>
);

export default QuadrantBoard;
