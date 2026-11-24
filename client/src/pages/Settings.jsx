import { useState } from 'react';
import { Check, HeartPulse, Lock, Mail, Save, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { Field, Input, Select } from '../components/ui/FormControls.jsx';
import { initials } from '../utils/format.js';

const CURRENCIES = [
  { code: 'USD', label: 'USD · US Dollar' },
  { code: 'EUR', label: 'EUR · Euro' },
  { code: 'GBP', label: 'GBP · British Pound' },
  { code: 'CAD', label: 'CAD · Canadian Dollar' },
  { code: 'AUD', label: 'AUD · Australian Dollar' },
  { code: 'TND', label: 'TND · Tunisian Dinar' },
  { code: 'MAD', label: 'MAD · Moroccan Dirham' },
  { code: 'EGP', label: 'EGP · Egyptian Pound' },
  { code: 'INR', label: 'INR · Indian Rupee' },
];

const Settings = () => {
  const { user, updatePreferences, logout } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'USD' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [cycleOn, setCycleOn] = useState(Boolean(user?.cycleTrackingEnabled));
  const [savingCycle, setSavingCycle] = useState(false);

  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setSavingProfile(true);
    try {
      await updatePreferences({ name: profile.name.trim(), currency: profile.currency });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleCycle = async (enabled) => {
    setCycleOn(enabled);
    setSavingCycle(true);
    try {
      await updatePreferences({ cycleTrackingEnabled: enabled });
      toast.success(enabled ? 'Cycle tracking enabled' : 'Cycle tracking disabled');
    } catch (err) {
      setCycleOn(!enabled);
      toast.error(getErrorMessage(err));
    } finally {
      setSavingCycle(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const next = {};
    if (!passwords.password) next.password = 'Password is required';
    else if (passwords.password.length < 6) next.password = 'Use at least 6 characters';
    if (passwords.confirm !== passwords.password) next.confirm = 'Passwords do not match';
    setPwErrors(next);
    if (Object.keys(next).length) return;

    setSavingPassword(true);
    try {
      await updatePreferences({ password: passwords.password });
      toast.success('Password changed');
      setPasswords({ password: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, preferences and account security. Private data stays tied to your account only."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Identity summary */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-espresso-800 font-display text-xl font-semibold text-cream-100">
              {initials(user?.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold text-espresso-900">{user?.name}</p>
              <p className="flex items-center gap-1.5 truncate text-xs text-taupe-600">
                <Mail size={12} /> {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge color="#5F8A79">{user?.currency || 'USD'}</Badge>
            <Badge color={cycleOn ? '#6E8FAE' : '#9FAEBC'}>{cycleOn ? 'Cycle tracking on' : 'Cycle tracking off'}</Badge>
          </div>
          <Button variant="outline" className="mt-5 w-full" onClick={logout}>
            Sign out
          </Button>
        </Card>

        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader title="Profile" subtitle="How your workspace greets you" icon={UserIcon} />
          <form onSubmit={saveProfile} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <div className="relative">
                  <UserIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-400" />
                  <Input
                    className="pl-10"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
              </Field>
              <Field label="Email address" hint="Email is used to sign in and cannot be changed here.">
                <Input value={user?.email || ''} disabled className="opacity-60" />
              </Field>
            </div>
            <Field label="Preferred currency" hint="Used across your finances and reports.">
              <Select value={profile.currency} onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end">
              <Button type="submit" icon={Save} loading={savingProfile}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Cycle tracking */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Cycle tracking"
            subtitle="Optional, private, and entirely under your control"
            icon={HeartPulse}
          />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm text-espresso-800">
                Turn on an approximate menstrual cycle tracker with a current-phase estimate and a gentle cycle calendar.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-taupe-500">
                Estimates are informational only. Any energy or workload suggestions are optional and are never assumed to
                apply to everyone — symptoms and energy vary from person to person. You can edit or delete any record, and
                you can switch this off at any time.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={cycleOn}
              disabled={savingCycle}
              onClick={() => toggleCycle(!cycleOn)}
              className={`inline-flex h-9 w-16 shrink-0 items-center rounded-full border transition ${
                cycleOn ? 'border-olive-500 bg-olive-500' : 'border-sand-300 bg-sand-200'
              } ${savingCycle ? 'opacity-60' : ''}`}
              aria-label="Toggle cycle tracking"
            >
              <span
                className={`ml-1 grid h-7 w-7 place-items-center rounded-full bg-cream-50 text-olive-600 shadow-soft transition-transform ${
                  cycleOn ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {cycleOn && <Check size={15} />}
              </span>
            </button>
          </div>
        </Card>

        {/* Security */}
        <Card className="lg:col-span-3">
          <CardHeader title="Security" subtitle="Change your account password" icon={ShieldCheck} />
          <form onSubmit={savePassword} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" error={pwErrors.password} required>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-400" />
                  <Input
                    type="password"
                    autoComplete="new-password"
                    className="pl-10"
                    value={passwords.password}
                    onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
                    placeholder="At least 6 characters"
                  />
                </div>
              </Field>
              <Field label="Confirm new password" error={pwErrors.confirm} required>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-400" />
                  <Input
                    type="password"
                    autoComplete="new-password"
                    className="pl-10"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="Re-enter password"
                  />
                </div>
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" icon={Lock} loading={savingPassword}>
                Update password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
