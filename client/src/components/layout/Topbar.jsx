import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Settings as SettingsIcon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { formatDate, initials } from '../../utils/format.js';

const Topbar = ({ onMenu }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const firstName = (user?.name || '').split(' ')[0] || 'there';

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-cream-100/85 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-sand-200 bg-cream-50 p-2 text-espresso-700 transition hover:bg-sand-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <div className="hidden sm:block">
            <p className="text-xs text-taupe-600">{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p className="font-display text-sm font-semibold text-espresso-900">Welcome back, {firstName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-9 w-9 place-items-center rounded-xl border border-sand-200 bg-cream-50 text-espresso-700 transition hover:bg-sand-100"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-sand-200 bg-cream-50 px-2.5 py-1.5 transition hover:bg-sand-100"
            >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-espresso-800 text-xs font-semibold text-cream-100">
              {initials(user?.name)}
            </span>
            <span className="hidden text-sm font-medium text-espresso-800 sm:block">{user?.name}</span>
            <ChevronDown size={15} className="text-taupe-500" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-sand-200 bg-cream-50 p-1.5 shadow-lift animate-scale-in">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-espresso-900">{user?.name}</p>
                  <p className="truncate text-xs text-taupe-600">{user?.email}</p>
                </div>
                <div className="my-1 h-px bg-sand-200" />
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-espresso-700 transition hover:bg-sand-100"
                >
                  <SettingsIcon size={16} /> Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-terracotta-600 transition hover:bg-terracotta-500/10"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
