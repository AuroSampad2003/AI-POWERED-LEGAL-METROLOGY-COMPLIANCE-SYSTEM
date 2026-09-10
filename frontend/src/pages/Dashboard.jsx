import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import InspectionRow from '../components/InspectionRow';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import InspectionResultViewer from '../components/InspectionResultViewer';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);

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
        {selectedInspection ? (
          <InspectionResultViewer
            inspection={selectedInspection}
            onBack={() => setSelectedInspection(null)}
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-[26px] font-semibold text-ink-900 tracking-tight">
                  {greeting()}, {user?.fullName?.split(' ')[0]}
                </h2>
                <p className="text-sm text-ink-500 mt-1">
                  Here's how your product inspections are looking
                </p>
              </div>
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate('/inspection/new')}
                className="w-full sm:w-auto gap-1.5"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New product inspection
              </Button>
            </div>

            {error && (
              <div className="mb-5 px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
                {error}
              </div>
            )}

            {loading ? (
              <Loader />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  <StatCard
                    label="Total inspections"
                    value={stats?.totalInspections ?? 0}
                    icon={ClipboardList}
                  />
                  <StatCard
                    label="Pending"
                    value={stats?.pending ?? 0}
                    tone="warn"
                    icon={Clock}
                  />
                  <StatCard
                    label="Compliant"
                    value={stats?.compliant ?? 0}
                    tone="pass"
                    icon={CheckCircle2}
                  />
                  <StatCard
                    label="Non-compliant"
                    value={stats?.nonCompliant ?? 0}
                    tone="fail"
                    icon={XCircle}
                  />
                </div>

                <div className="bg-surface-raised rounded-xl border border-ink-200 shadow-sm shadow-ink-900/[0.03] overflow-hidden">
                  <div className="px-4 sm:px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-ink-900 truncate">Recent inspections</h3>
                        <p className="text-xs text-ink-400 truncate">Your latest product checks</p>
                      </div>
                    </div>
                    {recentInspections.length > 0 && (
                      <button
                        onClick={() => navigate('/inspections')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-600 transition-colors duration-150 shrink-0"
                      >
                        View all
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
                      </button>
                    )}
                  </div>
                  {recentInspections.length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title="No inspections yet"
                      message="Start your first product check to see it appear here."
                      action={
                        <Button variant="secondary" size="sm" onClick={() => navigate('/inspection/new')}>
                          Start an inspection
                        </Button>
                      }
                    />
                  ) : (
                    <div className="divide-y divide-ink-100">
                      {recentInspections.map((insp) => (
                        <InspectionRow
                          key={insp._id}
                          inspection={insp}
                          onClick={(item) => setSelectedInspection(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;