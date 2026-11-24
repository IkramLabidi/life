import { Check, Moon, Pencil, Plus, Trash2 } from 'lucide-react';
import { LIFE_ROLES, PRIORITY_META, ROLE_COLORS } from '../../utils/constants.js';
import { formatTime, toInputDate } from '../../utils/format.js';

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeekBoard = ({ days, tasks, restDays, onToggleRest, onAdd, onEdit, onDelete, onToggle, onMove }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
    {days.map((day, index) => {
      const key = toInputDate(day);
      const isRest = restDays.includes(key);
      const dayTasks = tasks
        .filter((t) => toInputDate(t.date) === key)
        .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
      const doneCount = dayTasks.filter((t) => t.completed).length;

      return (
        <div
          key={key}
          className={`day-col ${isRest ? 'bg-cream-100/80 opacity-90' : ''}`}
        >
          <div className="flex items-center justify-between gap-1 border-b border-sand-200 pb-2">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-espresso-800">
                {WEEKDAY_SHORT[index]}
              </p>
              <p className="text-[11px] text-taupe-500">
                {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onToggleRest(key)}
                title={isRest ? 'Mark as active day' : 'Mark as rest day'}
                className={`rounded-lg p-1.5 transition ${
                  isRest ? 'bg-taupe-500/20 text-taupe-600' : 'text-taupe-400 hover:bg-sand-100'
                }`}
              >
                <Moon size={14} />
              </button>
              <button
                type="button"
                onClick={() => onAdd(key)}
                title="Add task"
                className="rounded-lg p-1.5 text-taupe-400 transition hover:bg-sand-100 hover:text-espresso-700"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {isRest && (
            <p className="rounded-lg bg-taupe-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-taupe-600">
              Rest day
            </p>
          )}

          <div className="flex-1 space-y-1.5">
            {dayTasks.map((task) => {
              const meta = PRIORITY_META[task.priority] || PRIORITY_META.Q2;
              return (
                <div
                  key={task._id}
                  className={`group rounded-xl border border-sand-200 bg-cream-50 p-2.5 transition hover:shadow-soft ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onToggle(task)}
                      aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                      className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border transition ${
                        task.completed
                          ? 'border-olive-500 bg-olive-500 text-cream-50'
                          : 'border-sand-300 bg-cream-50 hover:border-olive-400'
                      }`}
                      style={{ height: 18, width: 18 }}
                    >
                      {task.completed && <Check size={12} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold leading-snug text-espresso-800 ${
                          task.completed ? 'line-through' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.time && (
                        <p className="mt-0.5 text-[11px] text-taupe-500">{formatTime(task.time)}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {meta.short}
                        </span>
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `${ROLE_COLORS[task.role] || '#9FAEBC'}1f`, color: ROLE_COLORS[task.role] || '#9FAEBC' }}
                        >
                          {task.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <select
                      value=""
                      onChange={(e) => e.target.value && onMove(task, e.target.value)}
                      className="max-w-[92px] rounded-lg border border-sand-200 bg-cream-50 px-1.5 py-1 text-[10px] text-taupe-600 outline-none focus:border-terracotta-400"
                      aria-label="Move task to another day"
                    >
                      <option value="">Move…</option>
                      {days.map((d, i) => {
                        const dk = toInputDate(d);
                        return (
                          <option key={dk} value={dk} disabled={dk === key}>
                            {WEEKDAY_SHORT[i]} {d.getDate()}
                          </option>
                        );
                      })}
                    </select>
                    <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="rounded-md p-1 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                        aria-label="Edit task"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task)}
                        className="rounded-md p-1 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                        aria-label="Delete task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="pt-1 text-[10px] text-taupe-400">
            {dayTasks.length ? `${doneCount}/${dayTasks.length} done` : 'No tasks'}
          </p>
        </div>
      );
    })}
  </div>
);

export default WeekBoard;
