import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/FormControls.jsx';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => {
    setForm({ email: 'demo@lifeos.app', password: 'demo1234' });
    setErrors({});
  };

  return (
    <AuthLayout
      title="Sign in to LifeOS"
      subtitle="Welcome back — let’s pick up where you left off."
      footer={
        <>
          Don’t have an account?{' '}
          <Link to="/register" className="link">
            Create one
          </Link>
        </>
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-sand-200 bg-cream-50 px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-espresso-800">Try the demo account</p>
          <p className="text-[11px] text-taupe-600">demo@lifeos.app · demo1234</p>
        </div>
        <Button variant="outline" size="sm" icon={Wand2} onClick={useDemo}>
          Fill
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Email address" error={errors.email} required>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-400" />
            <Input
              type="email"
              autoComplete="email"
              className="pl-10"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
            />
          </div>
        </Field>

        <Field label="Password" error={errors.password} required>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-400" />
            <Input
              type="password"
              autoComplete="current-password"
              className="pl-10"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
            />
          </div>
        </Field>

        <Button type="submit" className="w-full" size="lg" loading={loading} icon={loading ? undefined : ArrowRight}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
