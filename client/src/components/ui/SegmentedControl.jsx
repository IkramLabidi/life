const SegmentedControl = ({ options, value, onChange, className = '' }) => (
  <div className={`inline-flex rounded-xl border border-sand-200 bg-cream-50 p-1 ${className}`}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
          value === opt.value ? 'bg-espresso-800 text-cream-100 shadow-soft' : 'text-taupe-600 hover:bg-sand-100'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;
