import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axiosInstance.get('/complaints');
        setComplaints(res.data.complaints || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">My Complaints</h2>
          <p className="text-sm text-ink-500 mt-1">
            Complaints you've submitted, and where they stand in the review process.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Loading complaints" />
        ) : complaints.length === 0 ? (
          <div className="bg-surface border border-ink-200 rounded-xl">
            <EmptyState
              title="No complaints yet"
              message="When a scan finds a violation, you can report it directly from the inspection result."
              action={
                <Button variant="secondary" size="sm" onClick={() => navigate('/inspections')}>
                  View my inspections
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((c) => {
              const mainImg = c.images?.[0];
              return (
                <div
                  key={c._id}
                  onClick={() => navigate(`/complaints/${c._id}`)}
                  className="bg-surface rounded-xl border border-ink-200 hover:border-accent-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-video bg-ink-900 overflow-hidden flex items-center justify-center">
                    {mainImg?.annotatedImage || mainImg?.url ? (
                      <img
                        src={mainImg.annotatedImage || mainImg.url}
                        alt={c.productName || 'Complaint'}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-ink-400 font-mono">No image</span>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <Badge status={c.status} />
                    </div>
                  </div>

                  <div className="p-4 flex-1">
                    <p className="text-xs font-mono text-ink-400 mb-1">{c.complaintId}</p>
                    <h3 className="font-semibold text-sm text-ink-900 truncate">
                      {c.productName || 'Unnamed product'}
                    </h3>
                    <p className="text-xs text-ink-500 mt-1">
                      {c.violations?.length || 0} violation{c.violations?.length === 1 ? '' : 's'} ·{' '}
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyComplaints;