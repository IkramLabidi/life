export const Field = ({ label, error, hint, required, children, className = '' }) => (
  <label className={`block ${className}`}>
    {label && (
      <span className="label">
        {label}
        {required && <span className="text-terracotta-500"> *</span>}
      </span>
    )}
    {children}
    {hint && !error && <span className="mt-1 block text-xs text-taupe-500">{hint}</span>}
    {error && <span className="mt-1 block text-xs font-medium text-terracotta-600">{error}</span>}
  </label>
);

export const Input = ({ className = '', ...props }) => <input className={`input ${className}`} {...props} />;

export const Select = ({ className = '', children, ...props }) => (
  <select className={`input ${className}`} {...props}>
    {children}
  </select>
);

export const Textarea = ({ className = '', rows = 3, ...props }) => (
  <textarea rows={rows} className={`input resize-none ${className}`} {...props} />
);
