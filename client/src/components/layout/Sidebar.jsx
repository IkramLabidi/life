import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/finances', label: 'Finances', icon: Wallet },
  { to: '/planner', label: 'Weekly Planner', icon: ClipboardList },
  { to: '/health', label: 'Health & Fitness', icon: HeartPulse },
  { to: '/study', label: 'Study', icon: GraduationCap },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const SidebarContent = ({ onNavigate }) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center gap-2.5 px-5 py-5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-terracotta-500 text-[#FFFFFF] shadow-soft">
        <Sparkles size={18} />
      </span>
      <div>
        <p className="font-display text-lg font-semibold leading-tight text-[#F4F7FA]">LifeOS</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#ADB8C4]">Personal Dashboard</p>
      </div>
    </div>

    <nav className="flex-1 space-y-1 overflow-y-auto scroll-thin px-3 py-2">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-[#F4F7FA] text-[#1E2833] shadow-soft'
                : 'text-[#B9C6D2] hover:bg-white/10 hover:text-[#F4F7FA]'
            }`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="mx-3 mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] leading-relaxed text-[#B9C6D2]">
        Your space to plan, track and grow — one habit at a time.
      </p>
    </div>
  </div>
);

const Sidebar = ({ open, onClose }) => (
  <>
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink-900 lg:flex">
      <SidebarContent />
    </aside>

    {open && (
      <div className="fixed inset-0 z-[100] lg:hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
        <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-ink-900 shadow-lift animate-fade-in">
          <SidebarContent onNavigate={onClose} />
        </aside>
      </div>
    )}
  </>
);

export default Sidebar;
