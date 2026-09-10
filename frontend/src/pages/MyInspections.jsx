import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Gauge, Calendar, ImageOff, Plus } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import InspectionResultViewer from '../components/InspectionResultViewer';

const FILTERS = ['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'ANALYZED'];

const filterLabel = (filter) => {
  if (filter === 'ALL') return 'All results';
  const word = filter.replace('_', ' ').toLowerCase();
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const MyInspections = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInspections = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/inspections');
      setInspections(res.data.inspections || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inspections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInspections();
  }, []);

  const filteredInspections = inspections.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      (item.productName && item.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
                  My product inspections
                </h2>
                <p className="text-sm text-ink-500 mt-1">
                  View all your scanned products with OCR bounding boxes and Legal Metrology JSON reports.
                </p>
              </div>
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate('/inspection/new')}
                className="w-full sm:w-auto gap-1.5"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New inspection
              </Button>
            </div>

            {/* Filter and search bar */}
            <div className="bg-surface-raised p-4 rounded-xl border border-ink-200 shadow-sm shadow-ink-900/[0.03] mb-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search product or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-ink-200 rounded-lg placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto overflow-x-auto pb-1 sm:pb-0">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap ${
                      statusFilter === filter
                        ? 'bg-accent-700 text-white'
                        : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {filterLabel(filter)}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-5 px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
                {error}
              </div>
            )}

            {loading ? (
              <Loader label="Fetching saved inspections..." />
            ) : filteredInspections.length === 0 ? (
              <EmptyState
                title="No inspections found"
                message={
                  inspections.length === 0
                    ? "You haven't performed any product compliance checks yet."
                    : 'No inspections match your selected search criteria.'
                }
                action={
                  <Button variant="secondary" size="sm" onClick={() => navigate('/inspection/new')}>
                    Start an inspection
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredInspections.map((item) => {
                  const mainImg = item.images?.[0];
                  const imgSrc = mainImg?.annotatedImage || mainImg?.url;
                  const score = item.analysis?.legal_metrology_2011_compliance?.confidence_score;
                  const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedInspection(item)}
                      className="group flex flex-col bg-surface-raised rounded-2xl border border-ink-200 shadow-sm shadow-ink-900/[0.04] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                      {/* Thumbnail with overlaid title */}
                      <div className="relative aspect-video bg-ink-900 overflow-hidden">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.productName || 'Inspection'}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="flex items-center gap-1.5 text-xs text-ink-400">
                              <ImageOff className="w-3.5 h-3.5" strokeWidth={1.75} />
                              No image
                            </span>
                          </div>
                        )}

                        <div className="absolute top-3 right-3">
                          <Badge status={item.status} />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 pt-10 pb-3 px-4 bg-gradient-to-t from-black/75 via-black/25 to-transparent">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {item.productName || 'Unnamed product'}
                          </h3>
                          <p className="text-xs text-white/70 mt-0.5 truncate">
                            {item.category || 'General'}
                          </p>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between text-xs text-ink-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                          {date}
                        </span>
                        {score !== undefined && (
                          <span className="flex items-center gap-1.5 font-medium text-ink-600">
                            <Gauge className="w-3.5 h-3.5" strokeWidth={2} />
                            {Math.round(score * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Footer link */}
                      <div className="mt-1 px-4 py-3 border-t border-ink-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-accent-700">View report</span>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center bg-accent-50 text-accent-700 group-hover:bg-accent-100 transition-colors duration-150">
                          <ArrowRight
                            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150"
                            strokeWidth={2.25}
                          />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyInspections;