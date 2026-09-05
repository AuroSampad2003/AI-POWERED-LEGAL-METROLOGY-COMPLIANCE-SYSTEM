import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Field, { inputClasses } from '../components/ui/Field';
import Button from '../components/ui/Button';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Officer sign in"
      title="Inspect. Verify. Enforce."
      subtitle="One workflow for AI-assisted package scanning, rule-based compliance checks, and complaint enforcement."
    >
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Sign in</h2>
        <p className="text-sm text-ink-500 mt-1.5">
          New officer?{' '}
          <Link to="/register" className="text-accent-600 font-medium hover:text-accent-700">
            Register an account
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-5 px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={inputClasses(false)}
            placeholder="officer@department.gov.in"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className={inputClasses(false)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full mt-2">
          {loading ? 'Signing in' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
