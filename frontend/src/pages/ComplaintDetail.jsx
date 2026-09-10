import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    FileWarning,
    Image as ImageIcon,
    MessageSquare,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
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
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                    <Loader label="Loading complaint" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !complaint) {
        return (
            <DashboardLayout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-800">
                                    Unable to load complaint
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                    {error || 'Complaint not found'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const currentImage = complaint.images?.[selectedImage];

    return (
        <DashboardLayout>
            <div className="min-h-full bg-[#f8faf9]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9">

                    {/* Back */}
                    <button
                        type="button"
                        onClick={() => navigate('/complaints')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-accent-700 transition-colors cursor-pointer mb-5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to my complaints
                    </button>

                    {/* Header */}
                    <header className="bg-white border border-ink-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                                        <ClipboardCheck className="w-3.5 h-3.5" />
                                        Complaint
                                    </span>
                                    <span className="text-ink-200">•</span>
                                    <span className="text-[11px] font-mono text-ink-400 truncate">
                                        {complaint.complaintId}
                                    </span>
                                </div>

                                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
                                    {complaint.productName || 'Unnamed product'}
                                </h2>

                                <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs text-ink-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        Submitted {new Date(complaint.createdAt).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0">
                                <Badge status={complaint.status} />
                            </div>
                        </div>
                    </header>

                    {/* Status */}
                    <section className="bg-white border border-ink-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-accent-700" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-ink-900">Complaint status</h3>
                                <p className="text-[11px] text-ink-400 mt-0.5">
                                    Track the progress of your report
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-1">
                            <StatusTimeline status={complaint.status} />
                        </div>
                    </section>

                    {/* Main content */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">

                        {/* Evidence */}
                        <section className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-accent-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-ink-900">Evidence</h3>
                                        <p className="text-[11px] text-ink-400 mt-0.5">
                                            Images attached to your complaint
                                        </p>
                                    </div>
                                </div>

                                {complaint.images?.length > 0 && (
                                    <span className="text-[11px] font-semibold text-ink-500 bg-ink-50 border border-ink-100 px-2.5 py-1 rounded-full">
                                        {complaint.images.length} {complaint.images.length === 1 ? 'image' : 'images'}
                                    </span>
                                )}
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="bg-ink-950 rounded-2xl min-h-[390px] sm:min-h-[470px] flex items-center justify-center overflow-hidden border border-ink-800">
                                    {currentImage ? (
                                        <img
                                            src={currentImage.annotatedImage || currentImage.url}
                                            alt={currentImage.view || 'Complaint evidence'}
                                            className="w-full h-full max-h-[560px] object-contain"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <FileWarning className="w-8 h-8 text-ink-500 mx-auto mb-2" />
                                            <span className="text-sm text-ink-400">No image available</span>
                                        </div>
                                    )}
                                </div>

                                {complaint.images?.length > 1 && (
                                    <div className="mt-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 mb-2.5">
                                            Evidence views
                                        </p>

                                        <div className="flex flex-wrap gap-2.5">
                                            {complaint.images.map((img, idx) => {
                                                const active = selectedImage === idx;

                                                return (
                                                    <button
                                                        type="button"
                                                        key={idx}
                                                        onClick={() => setSelectedImage(idx)}
                                                        className={`group flex items-center gap-2 rounded-xl border p-1.5 pr-3 transition-all cursor-pointer ${
                                                            active
                                                                ? 'border-accent-600 bg-accent-50 ring-1 ring-accent-600'
                                                                : 'border-ink-200 bg-white hover:border-accent-300 hover:bg-ink-50'
                                                        }`}
                                                    >
                                                        <div className="w-12 h-11 rounded-lg overflow-hidden bg-ink-100 shrink-0">
                                                            <img
                                                                src={img.annotatedImage || img.url}
                                                                alt={img.view || `Image ${idx + 1}`}
                                                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-[10px] font-bold uppercase tracking-wide ${
                                                                active ? 'text-accent-700' : 'text-ink-600'
                                                            }`}>
                                                                {img.view || `Image ${idx + 1}`}
                                                            </p>
                                                            <p className="text-[10px] text-ink-400 mt-0.5">
                                                                {active ? 'Selected' : 'View'}
                                                            </p>
                                                        </div>
                                                        {active && (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-600 ml-1" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Details */}
                        <div className="space-y-5">

                            {/* Product */}
                            <section className="bg-white border border-ink-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center">
                                        <ClipboardCheck className="w-4 h-4 text-ink-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-ink-900">Product</h3>
                                        <p className="text-[11px] text-ink-400 mt-0.5">Inspected product details</p>
                                    </div>
                                </div>

                                <p className="text-base font-semibold text-ink-900">
                                    {complaint.productName || 'Unnamed product'}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs font-medium text-ink-600 bg-ink-50 border border-ink-100 px-2.5 py-1 rounded-md">
                                        {complaint.category || 'General'}
                                    </span>

                                    {complaint.complianceScore != null && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-700 bg-accent-50 border border-accent-100 px-2.5 py-1 rounded-md">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            AI confidence: {Math.round(complaint.complianceScore * 100)}%
                                        </span>
                                    )}
                                </div>
                            </section>

                            {/* Violations */}
                            <section className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                            <ShieldAlert className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-ink-900">Violations</h3>
                                            <p className="text-[11px] text-ink-400 mt-0.5">
                                                Compliance findings from the scan
                                            </p>
                                        </div>
                                    </div>

                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                                        <AlertTriangle className="w-3 h-3" />
                                        {complaint.violations?.length || 0}
                                    </span>
                                </div>

                                <div className="p-5">
                                    {complaint.violations?.length ? (
                                        <div className="space-y-2.5">
                                            {complaint.violations.map((v, index) => (
                                                <div
                                                    key={v.key}
                                                    className="rounded-xl border border-red-100 bg-red-50/60 p-3.5"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-white border border-red-200 flex items-center justify-center text-[10px] font-bold text-red-600 shrink-0">
                                                            {index + 1}
                                                        </span>

                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-ink-800 leading-5">
                                                                {v.title}
                                                            </p>
                                                            <span className="inline-block text-[10px] font-medium text-red-600 mt-1">
                                                                {v.rule}
                                                            </span>
                                                            <p className="text-xs text-ink-600 leading-5 mt-1.5">
                                                                {v.reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border border-green-100">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                            <p className="text-sm text-green-700">No violations recorded.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* User description */}
                            {complaint.description && (
                                <section className="bg-white border border-ink-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                                            <MessageSquare className="w-4 h-4 text-accent-700" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-ink-900">Your description</h3>
                                            <p className="text-[11px] text-ink-400 mt-0.5">Additional context you provided</p>
                                        </div>
                                    </div>

                                    <div className="bg-ink-50/70 border border-ink-100 rounded-xl p-3.5">
                                        <p className="text-sm text-ink-700 leading-6 whitespace-pre-wrap">
                                            {complaint.description}
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* Admin remarks */}
                            <section className="bg-white border border-ink-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-amber-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-ink-900">Admin remarks</h3>
                                        <p className="text-[11px] text-ink-400 mt-0.5">Updates from the reviewing team</p>
                                    </div>
                                </div>

                                {complaint.adminRemarks?.trim() ? (
                                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5">
                                        <p className="text-sm text-ink-700 leading-6 whitespace-pre-wrap">
                                            {complaint.adminRemarks}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-ink-50 border border-ink-100">
                                        <MessageSquare className="w-4 h-4 text-ink-400 shrink-0" />
                                        <p className="text-sm text-ink-500">No remarks yet.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ComplaintDetail;
