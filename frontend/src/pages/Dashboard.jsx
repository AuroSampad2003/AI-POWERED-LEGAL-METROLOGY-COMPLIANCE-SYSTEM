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
import InspectionResultViewer from '../components/InspectionResultViewer';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const greeting = () => 'Welcome';

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

  const totalInspections = stats?.totalInspections ?? 0;
  const compliantCount = stats?.compliant ?? 0;
  const nonCompliantCount = stats?.nonCompliant ?? 0;
  const pendingCount = stats?.pending ?? 0;

  const compliancePieData = [
    { name: 'Compliant', value: compliantCount || 0, fill: '#16a34a' },
    { name: 'Non-Compliant', value: nonCompliantCount || 0, fill: '#dc2626' },
    { name: 'Pending', value: pendingCount || 0, fill: '#d97706' }
  ];

  const trendData = [
    { day: 'Mon', uploads: 3, analyses: 2 },
    { day: 'Tue', uploads: 6, analyses: 5 },
    { day: 'Wed', uploads: 10, analyses: 8 },
    { day: 'Thu', uploads: 7, analyses: 6 },
    { day: 'Fri', uploads: 14, analyses: 11 },
    { day: 'Sat', uploads: 9, analyses: 7 },
    { day: 'Sun', uploads: 16, analyses: 14 }
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {selectedInspection ? (
          <InspectionResultViewer
            inspection={selectedInspection}
            onBack={() => setSelectedInspection(null)}
          />
        ) : (
          <>
            <div className="reveal-up mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="section-kicker mb-2">Your compliance workspace</p>
                <h2 className="font-display text-2xl sm:text-[26px] font-semibold text-ink-900 tracking-tight">
                  {greeting()}, {user?.fullName?.split(' ')[0]}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500">
                  Here's how your product inspections are looking
                </p>
              </div>
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate('/inspection/new')}
                className="w-full shrink-0 gap-1.5 sm:w-auto"
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
                <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

                {/* Recharts Analytics Trends */}
                <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Chart 1: Total Uploads & Analyses Trend */}
                  <div className="surface-card rounded-2xl p-5 reveal-up stagger-1 space-y-3">
                    <div className="flex justify-between items-center border-b border-ink-100 pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-ink-900">Total Uploads & Analysis Trend</h3>
                        <p className="text-xs text-ink-400">Weekly breakdown of uploaded package scans vs analyses</p>
                      </div>
                      <span className="text-xs font-semibold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full border border-accent-200/60">
                        {totalInspections} Inspections
                      </span>
                    </div>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="uploads" stroke="#2563eb" fillOpacity={1} fill="url(#colorUploads)" name="Image Uploads" />
                          <Area type="monotone" dataKey="analyses" stroke="#16a34a" fillOpacity={1} fill="url(#colorAnalyses)" name="Completed Audits" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Declarations Compliance Ratio */}
                  <div className="surface-card rounded-2xl p-5 reveal-up stagger-2 space-y-3">
                    <div className="flex justify-between items-center border-b border-ink-100 pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-ink-900">Compliance Ratio</h3>
                        <p className="text-xs text-ink-400">Distribution of product compliance audit outcomes</p>
                      </div>
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200/60">
                        {compliantCount} Compliant
                      </span>
                    </div>
                    <div className="h-56 w-full flex items-center justify-center pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={compliancePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {compliancePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Inspections Table Container */}
                <div className="surface-card reveal-up stagger-3 overflow-hidden rounded-2xl">
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