import Card from './Card.jsx';

const StatCard = ({ icon: Icon, label, value, sub, accent = '#6E8FAE', footer }) => (
  <Card className="card-hover p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-taupe-600">{label}</p>
        <p className="mt-2 font-display text-2xl font-semibold text-espresso-900">{value}</p>
      </div>
      {Icon && (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon size={18} />
        </span>
      )}
    </div>
    {sub && <p className="mt-3 text-xs text-taupe-600">{sub}</p>}
    {footer}
  </Card>
);

export default StatCard;
