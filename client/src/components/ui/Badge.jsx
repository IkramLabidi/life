const Badge = ({ children, color = '#9FAEBC', bg, className = '', dot = false }) => (
  <span
    className={`chip ${className}`}
    style={{
      color,
      backgroundColor: bg || `${color}1f`,
      borderColor: `${color}33`,
    }}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
    {children}
  </span>
);

export default Badge;
