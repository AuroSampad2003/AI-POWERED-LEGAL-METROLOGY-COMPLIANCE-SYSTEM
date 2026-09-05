import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import InspectionRow from '../components/InspectionRow';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/inspections/stats/dashboard');
        setStats(res.data.stats);
        setRecentInspections(res.data.recentInspections);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Welcome, {user?.fullName?.split(' ')[0]}
            </h2>
            <p className="text-sm text-ink-500 mt-1">Here is your inspection overview</p>
          </div>
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate('/inspection/new')}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
            </svg>
            New product inspection
          </Button>
        </div>

        {error && (
          <div className="mb-5 px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Loading your inspections" />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <StatCard label="Total inspections" value={stats?.totalInspections ?? 0} />
              <StatCard label="Pending" value={stats?.pending ?? 0} tone="warn" />
              <StatCard label="Compliant" value={stats?.compliant ?? 0} tone="pass" />
              <StatCard label="Non-compliant" value={stats?.nonCompliant ?? 0} tone="fail" />
            </div>

            <div className="bg-surface rounded-xl border border-ink-200 overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-800">Recent inspections</h3>
                {recentInspections.length > 0 && (
                  <span className="text-xs text-ink-400">{recentInspections.length} shown</span>
                )}
              </div>
              {recentInspections.length === 0 ? (
                <EmptyState
                  title="No inspections yet"
                  message="Start your first product check to see it appear here."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => navigate('/inspection/new')}>
                      Start an inspection
                    </Button>
                  }
                />
              ) : (
                recentInspections.map((insp) => <InspectionRow key={insp._id} inspection={insp} />)
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
