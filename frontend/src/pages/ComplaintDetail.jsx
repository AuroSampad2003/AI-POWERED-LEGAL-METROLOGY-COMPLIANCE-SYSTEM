import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import Badge from '../components/ui/Badge';
import StatusTimeline from '../components/StatusTimeline';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const res = await axiosInstance.get(`/complaints/${id}`);
                setComplaint(res.data.complaint);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load complaint');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaint();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                    <Loader label="Loading complaint" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !complaint) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                    <div className="px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
                        {error || 'Complaint not found'}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const currentImage = complaint.images?.[selectedImage];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <button
                    onClick={() => navigate('/complaints')}
                    className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-4 transition-colors duration-150"
                >
                    ← Back to my complaints
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <p className="text-xs font-mono text-ink-400 mb-1">{complaint.complaintId}</p>
                        <h2 className="font-display text-2xl font-semibold text-ink-900">
                            {complaint.productName || 'Unnamed product'}
                        </h2>
                        <p className="text-sm text-ink-500 mt-1">
                            Submitted {new Date(complaint.createdAt).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <Badge status={complaint.status} />
                </div>

                {/* NEW: status timeline */}
                <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-5 mb-6">
                    <h3 className="text-sm font-semibold text-ink-800 mb-4">Status</h3>
                    <StatusTimeline status={complaint.status} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-5">
                        <h3 className="text-sm font-semibold text-ink-800 mb-3">Evidence</h3>
                        <div className="bg-ink-900 rounded-lg aspect-square flex items-center justify-center overflow-hidden mb-3">
                            {currentImage ? (
                                <img
                                    src={currentImage.annotatedImage || currentImage.url}
                                    alt={currentImage.view}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="text-xs text-ink-400">No image</span>
                            )}
                        </div>
                        {complaint.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {complaint.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${selectedImage === idx ? 'border-accent-600' : 'border-ink-200'
                                            }`}
                                    >
                                        <img src={img.annotatedImage || img.url} alt={img.view} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-5">
                            <h3 className="text-sm font-semibold text-ink-800 mb-2">Product</h3>
                            <p className="text-sm text-ink-600">{complaint.productName || 'Unnamed product'}</p>
                            <p className="text-xs text-ink-500 mt-1">{complaint.category || 'General'}</p>
                            {complaint.complianceScore != null && (
                                <p className="text-xs text-ink-500 mt-1">
                                    AI confidence: {Math.round(complaint.complianceScore * 100)}%
                                </p>
                            )}
                        </div>

                        <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-5">
                            <h3 className="text-sm font-semibold text-ink-800 mb-3">
                                Violations ({complaint.violations?.length || 0})
                            </h3>
                            {complaint.violations?.length ? (
                                <ul className="space-y-3">
                                    {complaint.violations.map((v) => (
                                        <li key={v.key} className="border-b border-ink-100 last:border-none pb-3 last:pb-0">
                                            <p className="text-sm font-medium text-ink-800">
                                                {v.title} <span className="text-ink-400 font-normal">({v.rule})</span>
                                            </p>
                                            <p className="text-xs text-ink-500 mt-0.5">{v.reason}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-ink-500">No violations recorded.</p>
                            )}
                        </div>

                        {complaint.description && (
                            <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-5">
                                <h3 className="text-sm font-semibold text-ink-800 mb-2">Your description</h3>
                                <p className="text-sm text-ink-600 leading-relaxed">{complaint.description}</p>
                            </div>
                        )}

                        {/* NEW: admin remarks */}
                        <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-5">
                            <h3 className="text-sm font-semibold text-ink-800 mb-2">Admin Remarks</h3>
                            {complaint.adminRemarks?.trim() ? (
                                <p className="text-sm text-ink-600 leading-relaxed">{complaint.adminRemarks}</p>
                            ) : (
                                <p className="text-sm text-ink-500">No remarks yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ComplaintDetail;