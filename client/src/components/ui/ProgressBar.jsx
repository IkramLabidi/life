const ProgressBar = ({ value = 0, color = '#5F8A79', height = 8, className = '' }) => {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-sand-200 ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
};

export default ProgressBar;
