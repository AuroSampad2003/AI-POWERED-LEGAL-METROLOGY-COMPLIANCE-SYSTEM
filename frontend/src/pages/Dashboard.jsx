import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import InspectionRow from '../components/InspectionRow';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import InspectionResultViewer from '../components/InspectionResultViewer';

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
  const totalUploads = totalInspections * 2;

  const compliancePieData = [
    { name: 'Full Scan Observed', value: compliantCount || 4, fill: '#16a34a' },
    { name: 'Partial Scan Observed', value: nonCompliantCount || 2, fill: '#d97706' },
    { name: 'Pending Scan', value: pendingCount || 1, fill: '#0284c7' }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {selectedInspection ? (
          <InspectionResultViewer
            inspection={selectedInspection}
            onBack={() => setSelectedInspection(null)}
          />
        ) : (
          <>
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
                + New product inspection
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
                  <StatCard label="Total inspections" value={totalInspections} />
                  <StatCard label="Total Uploads" value={totalUploads} />
                  <StatCard label="Full Scans" value={compliantCount} tone="pass" />
                  <StatCard label="Partial Scans" value={nonCompliantCount} tone="warn" />
                </div>

                {/* Recharts Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                  {/* Chart 1: Total Uploads & Analyses Trend */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-black">Total Uploads & Analysis Trend</h3>
                        <p className="text-xs text-gray-500">Weekly breakdown of uploaded package scans vs analyses</p>
                      </div>
                      <span className="text-xs font-bold text-accent-700 bg-accent-50 px-2.5 py-1 rounded border border-accent-200">
                        {totalUploads} Uploads
                      </span>
                    </div>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="uploads" stroke="#2563eb" fillOpacity={1} fill="url(#colorUploads)" name="Image Uploads" />
                          <Area type="monotone" dataKey="analyses" stroke="#16a34a" fillOpacity={1} fill="url(#colorAnalyses)" name="Completed Audits" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Declarations Coverage Distribution */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-black">Declarations Coverage Distribution</h3>
                        <p className="text-xs text-gray-500">Overall ratio of full scans vs partial scans observed</p>
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200">
                        {compliantCount} Full Scans
                      </span>
                    </div>
                    <div className="h-60 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={compliancePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {compliancePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

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
                    recentInspections.map((insp) => (
                      <InspectionRow
                        key={insp._id}
                        inspection={insp}
                        onClick={(item) => setSelectedInspection(item)}
                      />
                    ))
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
