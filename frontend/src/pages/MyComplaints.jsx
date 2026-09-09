import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  FileWarning,
  MessageSquareWarning,
  RefreshCw,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await axiosInstance.get('/complaints');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8faf9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-9">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent-50 border border-accent-100 flex items-center justify-center">
                  <MessageSquareWarning className="w-4 h-4 text-accent-700" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent-700">
                  Compliance reports
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
                My Complaints
              </h2>

              <p className="text-sm sm:text-[15px] text-ink-500 mt-1.5">
                Complaints you've submitted and where they stand in the review process.
              </p>
            </div>

            {!loading && complaints.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-ink-200 text-xs font-semibold text-ink-600 shadow-sm">
                  <ClipboardList className="w-3.5 h-3.5 text-accent-600" />
                  {complaints.length} {complaints.length === 1 ? 'complaint' : 'complaints'}
                </span>

                <button
                  type="button"
                  onClick={fetchComplaints}
                  disabled={loading}
                  className="w-9 h-9 rounded-lg bg-white border border-ink-200 text-ink-500 hover:text-accent-700 hover:border-accent-300 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh complaints"
                  aria-label="Refresh complaints"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-800">
                    Unable to load complaints
                  </p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-6 sm:p-8">
              <Loader label="Loading complaints" />
            </div>
          ) : complaints.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 bg-accent-600" />
              <div className="py-6">
                <EmptyState
                  title="No complaints yet"
                  message="When a scan finds a violation, you can report it directly from the inspection result."
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/inspections')}
                    >
                      View my inspections
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <>
              {/* Small result summary */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-ink-400">
                  Your submitted reports
                </p>
                <p className="text-xs text-ink-400">
                  Select a complaint to view details
                </p>
              </div>

              {/* Complaint cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {complaints.map((c) => {
                  const mainImg = c.images?.[0];
                  const violationCount = c.violations?.length || 0;

                  return (
                    <button
                      type="button"
                      key={c._id}
                      onClick={() => navigate(`/complaints/${c._id}`)}
                      className="group text-left bg-white rounded-2xl border border-ink-200 hover:border-accent-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] bg-[#0f1a2e] overflow-hidden flex items-center justify-center">
                        {mainImg?.annotatedImage || mainImg?.url ? (
                          <img
                            src={mainImg.annotatedImage || mainImg.url}
                            alt={c.productName || 'Complaint evidence'}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <FileWarning className="w-7 h-7 mb-2" />
                            <span className="text-xs">No image available</span>
                          </div>
                        )}

                        {/* Dark image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a2e] via-transparent to-transparent pointer-events-none" />

                        {/* Status */}
                        <div className="absolute top-3 right-3">
                          <Badge status={c.status} />
                        </div>

                        {/* Violation count */}
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1.5 bg-[#0f1a2e]/85 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1.5 rounded-full">
                            <FileWarning className="w-3 h-3" />
                            {violationCount} {violationCount === 1 ? 'violation' : 'violations'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4.5 sm:p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-mono font-medium text-ink-400 truncate mb-1.5">
                              {c.complaintId}
                            </p>

                            <h3 className="font-semibold text-[15px] text-ink-900 truncate">
                              {c.productName || 'Unnamed product'}
                            </h3>
                          </div>

                          <span className="w-8 h-8 rounded-lg bg-ink-50 group-hover:bg-accent-50 flex items-center justify-center shrink-0 transition-colors">
                            <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-accent-700 group-hover:translate-x-0.5 transition-all" />
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100">
                          <span className="text-xs text-ink-500">
                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>

                          <span className="w-1 h-1 rounded-full bg-ink-300" />

                          <span className="text-xs text-ink-400">
                            Complaint report
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyComplaints;
