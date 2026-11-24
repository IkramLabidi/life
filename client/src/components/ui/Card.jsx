const Card = ({ className = '', children, ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, icon: Icon, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 border-b border-sand-200 px-5 py-4 ${className}`}>
    <div className="flex items-center gap-3">
      {Icon && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand-100 text-espresso-700">
          <Icon size={17} />
        </span>
      )}
      <div>
        <h3 className="text-base font-semibold text-espresso-900">{title}</h3>
        {subtitle && <p className="text-xs text-taupe-600">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

export default Card;
