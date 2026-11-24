import { useMemo, useState } from 'react';
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Info, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EventModal from '../components/calendar/EventModal.jsx';
import useApiData from '../hooks/useApiData.js';
import useCollection from '../hooks/useCollection.js';
import { EVENT_CATEGORY_BG, EVENT_CATEGORY_COLORS } from '../utils/constants.js';
import { addDays, formatDate, formatTime, startOfWeek, toInputDate, todayISO } from '../utils/format.js';

const VIEWS = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
];
const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

const itemColor = (item) => {
  if (item.type === 'deadline') return EVENT_CATEGORY_COLORS.Academic;
  if (item.type === 'task') return EVENT_CATEGORY_COLORS.Personal;
  return EVENT_CATEGORY_COLORS[item.category] || EVENT_CATEGORY_COLORS.Other;
};

const CalendarPage = () => {
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(() => new Date());
  const [eventModal, setEventModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [details, setDetails] = useState(null);
  const [busy, setBusy] = useState(false);

  const events = useCollection('/events');

  const { from, to } = useMemo(() => {
    if (view === 'month') {
      const first = startOfMonth(cursor);
      const gridStart = addDays(first, -((first.getDay() + 6) % 7));
      return { from: gridStart, to: addDays(gridStart, 41) };
    }
    if (view === 'week') {
      const ws = startOfWeek(cursor);
      return { from: ws, to: addDays(ws, 6) };
    }
    return { from: cursor, to: cursor };
  }, [view, cursor]);

  const feed = useApiData('/calendar', { from: toInputDate(from), to: toInputDate(to) });
  const items = feed.data?.items || [];

  const byDate = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      const key = toInputDate(it.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    });
    map.forEach((list) => list.sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99')));
    return map;
  }, [items]);

  const navigate = (dir) => {
    setCursor((c) => {
      if (view === 'month') return addMonths(c, dir);
      if (view === 'week') return addDays(c, dir * 7);
      return addDays(c, dir);
    });
  };

  const goToday = () => setCursor(new Date());

  const submitEvent = async (payload) => {
    setBusy(true);
    try {
      if (eventModal?.initial) await events.update(eventModal.initial._id, payload, 'Event updated');
      else await events.create(payload, 'Event added');
      setEventModal(null);
      feed.reload();
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const deleteEvent = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await events.remove(confirm.id, 'Event deleted');
      setConfirm(null);
      feed.reload();
    } finally {
      setBusy(false);
    }
  };

  const onItemClick = (item) => {
    if (item.type === 'event' && item.source === 'manual') {
      setEventModal({ initial: item, defaultDate: toInputDate(item.date) });
    } else {
      setDetails(item);
    }
  };

  const periodLabel = useMemo(() => {
    if (view === 'month') return cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (view === 'week') {
      const ws = startOfWeek(cursor);
      return `${formatDate(ws)} – ${formatDate(addDays(ws, 6))}`;
    }
    return cursor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }, [view, cursor]);

  const monthCells = useMemo(() => {
    if (view !== 'month') return [];
    const first = startOfMonth(cursor);
    const gridStart = addDays(first, -((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [view, cursor]);

  const ItemChip = ({ item, compact }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onItemClick(item);
      }}
      className={`w-full rounded-md px-1.5 py-1 text-left text-[10px] font-medium leading-tight transition hover:brightness-95 ${
        item.completed ? 'line-through opacity-60' : ''
      }`}
      style={{ backgroundColor: EVENT_CATEGORY_BG[item.category] || 'rgba(173, 184, 196,0.18)', color: itemColor(item) }}
      title={item.title}
    >
      <span className="flex items-center gap-1">
        {item.reminder && <Bell size={9} />}
        {item.startTime && !compact && <span className="opacity-80">{formatTime(item.startTime)}</span>}
        <span className="truncate">{item.title}</span>
      </span>
    </button>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Personal calendar"
        subtitle="Events, deadlines and tasks together — with a colour for each part of life."
        actions={
          <Button icon={Plus} variant="accent" onClick={() => setEventModal({ initial: null, defaultDate: toInputDate(cursor) })}>
            New event
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-sand-200 p-2 text-taupe-500 transition hover:bg-sand-100" aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={goToday} className="rounded-lg border border-sand-200 px-3 py-2 text-xs font-semibold text-espresso-700 transition hover:bg-sand-100">
              Today
            </button>
            <button type="button" onClick={() => navigate(1)} className="rounded-lg border border-sand-200 p-2 text-taupe-500 transition hover:bg-sand-100" aria-label="Next">
              <ChevronRight size={16} />
            </button>
            <span className="ml-2 font-display text-base font-semibold text-espresso-900">{periodLabel}</span>
          </div>
          <SegmentedControl options={VIEWS} value={view} onChange={setView} />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-sand-200 px-4 py-2.5">
          {[...['Academic', 'Personal', 'Health', 'Financial', 'Other']].map((c) => (
            <span key={c} className="flex items-center gap-1.5 text-[11px] text-taupe-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EVENT_CATEGORY_COLORS[c] }} />
              {c}
            </span>
          ))}
        </div>
      </Card>

      {view === 'month' && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-sand-200 bg-sand-100/50">
            {WEEKDAY.map((w) => (
              <div key={w} className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-taupe-600">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells.map((day) => {
              const key = toInputDate(day);
              const dayItems = byDate.get(key) || [];
              const inMonth = day.getMonth() === cursor.getMonth();
              const isTodayCell = key === todayISO();
              return (
                <div
                  key={key}
                  onClick={() => {
                    setCursor(day);
                    setView('day');
                  }}
                  className={`min-h-[112px] cursor-pointer border-b border-r border-sand-200 p-1.5 transition hover:bg-sand-100/50 ${
                    inMonth ? 'bg-cream-50' : 'bg-cream-100/60'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${
                        isTodayCell ? 'bg-terracotta-500 text-cream-50' : inMonth ? 'text-espresso-700' : 'text-taupe-400'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventModal({ initial: null, defaultDate: key });
                      }}
                      className="rounded p-0.5 text-taupe-300 opacity-0 transition hover:text-terracotta-600 group-hover:opacity-100"
                      style={{ opacity: undefined }}
                      aria-label="Add event on this day"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item) => (
                      <ItemChip key={`${item.type}-${item.refId}`} item={item} />
                    ))}
                    {dayItems.length > 3 && (
                      <p className="px-1.5 text-[10px] font-semibold text-taupe-500">+{dayItems.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {view === 'week' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i)).map((day, i) => {
            const key = toInputDate(day);
            const dayItems = byDate.get(key) || [];
            const isTodayCell = key === todayISO();
            return (
              <div key={key} className={`day-col ${isTodayCell ? 'ring-2 ring-terracotta-400/40' : ''}`}>
                <div className="flex items-center justify-between border-b border-sand-200 pb-2">
                  <div className={isTodayCell ? 'text-terracotta-600' : ''}>
                    <p className="text-xs font-bold uppercase tracking-wide">{WEEKDAY[i]}</p>
                    <p className="text-[11px] text-taupe-500">{day.getDate()}</p>
                  </div>
                  <button type="button" onClick={() => setEventModal({ initial: null, defaultDate: key })} className="rounded-lg p-1.5 text-taupe-400 transition hover:bg-sand-100 hover:text-espresso-700" aria-label="Add event">
                    <Plus size={15} />
                  </button>
                </div>
                <div className="flex-1 space-y-1.5">
                  {dayItems.length ? (
                    dayItems.map((item) => (
                      <div key={`${item.type}-${item.refId}`} className="rounded-lg" style={{ borderLeft: `3px solid ${itemColor(item)}` }}>
                        <ItemChip item={item} />
                      </div>
                    ))
                  ) : (
                    <p className="px-1 text-[10px] text-taupe-400">No items</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'day' && (
        <Card>
          <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
            <div>
              <p className="font-display text-base font-semibold text-espresso-900">
                {cursor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs text-taupe-500">{(byDate.get(toInputDate(cursor)) || []).length} items</p>
            </div>
            <Button size="sm" icon={Plus} variant="outline" onClick={() => setEventModal({ initial: null, defaultDate: toInputDate(cursor) })}>
              Add event
            </Button>
          </div>
          <div className="space-y-2 p-4">
            {(byDate.get(toInputDate(cursor)) || []).length ? (
              (byDate.get(toInputDate(cursor)) || []).map((item) => (
                <div key={`${item.type}-${item.refId}`} className="flex items-start gap-3 rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-3">
                  <span className="mt-1 h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: itemColor(item) }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className={`text-sm font-semibold text-espresso-800 ${item.completed ? 'line-through opacity-60' : ''}`}>{item.title}</p>
                      {item.reminder && <Bell size={12} className="text-gold-500" />}
                    </div>
                    <p className="truncate text-xs text-taupe-500">
                      {item.startTime ? `${formatTime(item.startTime)}${item.endTime ? ` – ${formatTime(item.endTime)}` : ''} · ` : ''}
                      {item.category}
                      {item.description ? ` · ${item.description}` : ''}
                    </p>
                  </div>
                  <Badge color={itemColor(item)}>{item.type === 'event' ? item.category : item.type}</Badge>
                  <div className="flex items-center gap-1">
                    {item.type === 'event' && item.source === 'manual' ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => setEventModal({ initial: item, defaultDate: toInputDate(item.date) })}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-terracotta-600" onClick={() => setConfirm({ id: item.refId, title: item.title })}>
                          <Trash2 size={14} />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" icon={Info} onClick={() => setDetails(item)}>
                        Info
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid place-items-center gap-2 py-10 text-center">
                <CalendarDays size={26} className="text-taupe-400" />
                <p className="text-sm text-taupe-500">Nothing scheduled on this day.</p>
                <Button size="sm" icon={Plus} variant="accent" onClick={() => setEventModal({ initial: null, defaultDate: toInputDate(cursor) })}>
                  Add an event
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      <EventModal
        open={Boolean(eventModal)}
        onClose={() => setEventModal(null)}
        onSubmit={submitEvent}
        onDelete={
          eventModal?.initial
            ? () => {
                setConfirm({ id: eventModal.initial._id, title: eventModal.initial.title });
                setEventModal(null);
              }
            : undefined
        }
        saving={busy}
        initial={eventModal?.initial}
        defaultDate={eventModal?.defaultDate}
      />

      <Modal
        open={Boolean(details)}
        onClose={() => setDetails(null)}
        title={details?.title}
        size="sm"
        footer={
          <Button variant="outline" onClick={() => setDetails(null)}>
            Close
          </Button>
        }
      >
        {details && (
          <div className="space-y-2 text-sm text-taupe-600">
            <p>
              <span className="font-semibold text-espresso-800">Type:</span>{' '}
              {details.type === 'deadline' ? 'Academic deadline' : details.type === 'task' ? 'Planner task' : 'Event'}
            </p>
            <p>
              <span className="font-semibold text-espresso-800">Date:</span> {formatDate(details.date)}
              {details.startTime ? ` · ${formatTime(details.startTime)}` : ''}
            </p>
            {details.description && <p>{details.description}</p>}
            {details.type !== 'event' && (
              <p className="rounded-lg border border-sand-200 bg-cream-50 px-3 py-2 text-xs">
                This item is managed in the {details.type === 'deadline' ? 'Study' : 'Weekly Planner'} module — edit it
                there and the calendar updates automatically.
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={deleteEvent}
        loading={busy}
        title="Delete event?"
        message={`“${confirm?.title}” will be permanently removed from your calendar.`}
      />
    </div>
  );
};

export default CalendarPage;
