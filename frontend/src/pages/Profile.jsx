import {
  BadgeCheck,
  CalendarDays,
  Copy,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const Profile = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8faf9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center">
                <UserRound className="w-4.5 h-4.5 text-accent-700" />
              </div>

              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700">
                Account
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
              Profile
            </h2>

            <p className="text-sm sm:text-[15px] text-ink-500 mt-1.5">
              Manage and view your account information.
            </p>
          </div>

          {/* Profile card */}
          <section className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Green header */}
            <div className="h-24 sm:h-28 bg-gradient-to-r from-[#145f38] to-[#1f7548] relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-16 w-52 h-52 rounded-full border-[28px] border-white" />
                <div className="absolute right-24 top-8 w-20 h-20 rounded-full border-8 border-white" />
              </div>
            </div>

            {/* Identity */}
            <div className="px-5 sm:px-7 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative">

                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-accent-600 text-white border-4 border-white shadow-md flex items-center justify-center shrink-0">
                  <span className="text-2xl font-semibold">
                    {initials(user?.fullName) || 'U'}
                  </span>
                </div>

                <div className="min-w-0 pb-0.5">
                  <h3 className="text-xl font-semibold text-ink-900 truncate">
                    {user?.fullName || 'User'}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1 text-sm text-ink-500">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {user?.email || 'No email available'}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <div className="sm:ml-auto pb-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                      isAdmin
                        ? 'bg-purple-50 border-purple-100 text-purple-700'
                        : 'bg-accent-50 border-accent-100 text-accent-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isAdmin ? 'Administrator' : 'Consumer / User'}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-ink-100 mt-6 pt-5">

                <div className="flex items-center gap-2 mb-4">
                  <BadgeCheck className="w-4 h-4 text-accent-600" />
                  <h4 className="text-sm font-semibold text-ink-900">
                    Account information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Role */}
                  <div className="bg-ink-50/70 border border-ink-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-ink-400 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">
                        Role
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-ink-900">
                      {isAdmin ? 'Administrator' : 'Consumer / User'}
                    </p>

                    <p className="text-xs text-ink-400 mt-1">
                      Your access level on the platform
                    </p>
                  </div>

                  {/* Account ID */}
                  <div className="bg-ink-50/70 border border-ink-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-ink-400 mb-2">
                      <UserRound className="w-4 h-4" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">
                        Account ID
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 font-mono truncate">
                        {user?.id || '—'}
                      </p>

                      {user?.id && (
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard?.writeText(user.id)
                          }
                          className="w-7 h-7 rounded-md bg-white border border-ink-200 flex items-center justify-center text-ink-400 hover:text-accent-700 hover:border-accent-300 transition-colors shrink-0"
                          title="Copy account ID"
                          aria-label="Copy account ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-ink-400 mt-1">
                      Unique identifier for your account
                    </p>
                  </div>
                </div>
              </div>

              {/* Account note */}
              <div className="mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-accent-50/60 border border-accent-100">
                <CalendarDays className="w-4 h-4 text-accent-700 mt-0.5 shrink-0" />

                <div>
                  <p className="text-xs font-semibold text-accent-900">
                    Compliance platform account
                  </p>
                  <p className="text-xs text-accent-700/70 mt-0.5 leading-5">
                    Your account is used to securely associate inspections,
                    compliance reports, and complaints with your activity.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;