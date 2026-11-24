import { HeartPulse, GraduationCap, Moon, Sparkles, Sun, Wallet, ClipboardList } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

const FEATURES = [
  { icon: Wallet, text: 'Track bank balance, expenses and savings' },
  { icon: ClipboardList, text: 'Plan your week with Covey’s 7 Habits' },
  { icon: HeartPulse, text: 'Log meals, water, workouts and measurements' },
  { icon: GraduationCap, text: 'Manage subjects, sessions and deadlines' },
];

const AuthLayout = ({ title, subtitle, children, footer }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-xl border border-sand-200 bg-cream-50 text-espresso-700 shadow-soft transition hover:bg-sand-100 sm:right-6 sm:top-6"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-10 text-[#F4F7FA] lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(600px 400px at 10% 10%, rgba(110, 143, 174,0.35), transparent 60%), radial-gradient(600px 500px at 95% 90%, rgba(95, 138, 121,0.28), transparent 60%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-500 text-[#FFFFFF] shadow-soft">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="font-display text-xl font-semibold leading-tight">LifeOS</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#ADB8C4]">Personal Dashboard</p>
            </div>
          </div>

          <h2 className="mt-14 max-w-md font-display text-3xl font-semibold leading-snug text-[#F4F7FA]">
            One calm, organised home for every part of your life.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#B9C6D2]">
            Finances, weekly planning, health, study, calendar, goals and journaling — beautifully connected in a single
            dashboard.
          </p>

          <ul className="mt-10 space-y-3.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-[#EEF2F6]">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-terracotta-300">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#ADB8C4]">
          Built with React, Express & MongoDB · Your data stays private to your account.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-terracotta-500 text-[#FFFFFF]">
              <Sparkles size={18} />
            </span>
            <p className="font-display text-lg font-semibold text-espresso-900">LifeOS</p>
          </div>

          <h1 className="font-display text-2xl font-semibold text-espresso-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-taupe-600">{subtitle}</p>}

          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-taupe-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
