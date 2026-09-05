import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Field, { inputClasses } from '../components/ui/Field';
import Button from '../components/ui/Button';

const Register = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.response?.data?.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Officer onboarding"
      title="Register for inspection access"
      subtitle="Create an account to scan packaged commodities, review declarations, and raise compliance complaints."
    >
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Create your account</h2>
        <p className="text-sm text-ink-500 mt-1.5">
          Already registered?{' '}
          <Link to="/login" className="text-accent-600 font-medium hover:text-accent-700">
            Sign in instead
          </Link>
        </p>
      </div>

      {errors.general && (
        <div className="mb-5 px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
          <input
            id="fullName"
            type="text"
            name="fullName"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            className={inputClasses(errors.fullName)}
            placeholder="e.g. Anjali Sharma"
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={inputClasses(errors.email)}
            placeholder="officer@department.gov.in"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" htmlFor="password" error={errors.password}>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={inputClasses(errors.password)}
              placeholder="••••••••"
            />
          </Field>

          <Field label="Confirm" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={inputClasses(errors.confirmPassword)}
              placeholder="••••••••"
            />
          </Field>
        </div>

        <Field label="Role (development only)" htmlFor="role">
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className={inputClasses(false)}
          >
            <option value="USER">Inspector / User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>

        <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full mt-2">
          {loading ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Register;
