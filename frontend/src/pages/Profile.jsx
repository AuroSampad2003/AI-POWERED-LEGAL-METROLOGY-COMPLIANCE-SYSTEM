import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

const Profile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Profile</h2>
        <p className="text-sm text-ink-500 mt-1.5 mb-6">Your account information.</p>

        <div className="bg-surface border border-ink-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-full bg-accent-600 text-white text-lg font-semibold flex items-center justify-center shrink-0">
              {initials(user?.fullName) || 'U'}
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink-900 truncate">{user?.fullName}</p>
              <p className="text-sm text-ink-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-ink-100">
            <div>
              <p className="text-xs text-ink-400">Role</p>
              <p className="text-sm font-medium text-ink-800 mt-0.5">
                {user?.role === 'ADMIN' ? 'Admin' : 'Consumer / User'}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Account ID</p>
              <p className="text-sm font-medium text-ink-800 mt-0.5 truncate">{user?.id || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
