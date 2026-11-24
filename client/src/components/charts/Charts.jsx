import { ResponsiveContainer } from 'recharts';
import Card, { CardHeader } from '../ui/Card.jsx';

/** Warm, on-brand tooltip used by every Recharts chart in the app. */
export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-sand-200 bg-cream-50/95 px-3 py-2 shadow-lift backdrop-blur">
      {label !== undefined && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-taupe-600">{label}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry) => (
          <div key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-taupe-600">{entry.name}</span>
            <span className="ml-auto font-semibold text-espresso-800">
              {formatter ? formatter(entry.value, entry) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Card wrapper that gives Recharts a fixed, responsive height. */
const ChartCard = ({ title, subtitle, icon, action, height = 260, children, className = '' }) => (
  <Card className={className}>
    {(title || action) && <CardHeader title={title} subtitle={subtitle} icon={icon} action={action} />}
    <div className="px-3 py-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </Card>
);

export default ChartCard;
