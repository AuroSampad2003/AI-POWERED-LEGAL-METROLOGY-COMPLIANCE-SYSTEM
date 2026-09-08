import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import InspectionResultViewer from '../components/InspectionResultViewer';

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
                <h2 className="font-display text-2xl font-semibold text-ink-900">My Product Inspections</h2>
                <p className="text-sm text-ink-500 mt-1">
                  View all your scanned products with OCR bounding boxes and Legal Metrology JSON reports.
                </p>
              </div>
              <Button variant="accent" size="lg" onClick={() => navigate('/inspection/new')}>
                + New Inspection
              </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-surface p-4 rounded-xl border border-ink-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search product or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'ANALYZED'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      statusFilter === filter
                        ? 'bg-slate-900 text-white'
                        : 'bg-ink-100/70 text-ink-700 hover:bg-ink-200'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Results' : filter.replace('_', ' ')}
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
                    : "No inspections match your selected search criteria."
                }
                action={
                  <Button variant="secondary" size="sm" onClick={() => navigate('/inspection/new')}>
                    Start an Inspection
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInspections.map((item) => {
                  const mainImg = item.images?.[0];
                  const score = item.analysis?.legal_metrology_2011_compliance?.confidence_score;

                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedInspection(item)}
                      className="bg-surface rounded-xl border border-ink-200 hover:border-accent/40 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Thumbnail banner */}
                        <div className="relative aspect-16/9 bg-slate-900 overflow-hidden flex items-center justify-center">
                          {mainImg?.annotatedImage || mainImg?.url ? (
                            <img
                              src={mainImg.annotatedImage || mainImg.url}
                              alt={item.productName || 'Inspection'}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">No Image</span>
                          )}

                          <div className="absolute top-2.5 right-2.5">
                            <Badge status={item.status} />
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-ink-900 group-hover:text-accent transition-colors truncate">
                              {item.productName || 'Unnamed product'}
                            </h3>
                          </div>
                          <p className="text-xs text-ink-500 mb-3">
                            Category: {item.category || 'General'} • {new Date(item.createdAt).toLocaleDateString('en-IN')}
                          </p>

                          {/* Analysis indicators */}
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-ink-100 text-ink-600">
                            <span>Status: {item.status}</span>
                            {score !== undefined && (
                              <span className="font-mono text-[11px] text-ink-500">
                                Confidence: {Math.round(score * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-2.5 bg-ink-50/60 border-t border-ink-100 flex items-center justify-between text-xs font-semibold text-accent group-hover:bg-accent/5 transition-colors">
                        <span>View Annotated Image & JSON Report</span>
                        <span>→</span>
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
