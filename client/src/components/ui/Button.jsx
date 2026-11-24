import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-espresso-800 text-cream-100 hover:bg-espresso-900 border border-espresso-800',
  accent: 'bg-terracotta-500 text-cream-50 hover:bg-terracotta-600 border border-terracotta-500',
  outline: 'border border-sand-300 bg-cream-50 text-espresso-800 hover:bg-sand-100',
  ghost: 'border border-transparent text-espresso-700 hover:bg-sand-100',
  danger: 'bg-terracotta-600 text-cream-50 hover:brightness-95 border border-terracotta-600',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
    {children}
  </button>
);

export default Button;
