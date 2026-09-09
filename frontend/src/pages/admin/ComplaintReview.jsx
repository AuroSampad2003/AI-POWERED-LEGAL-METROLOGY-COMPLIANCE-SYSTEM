import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/admin/AdminSidebar';

const DECLARATION_META = [
    { key: 'manufacturer_details', title: 'Manufacturer / Packer Details', rule: 'Rule 6(1)(a)' },
    { key: 'country_of_origin', title: 'Country of Origin', rule: 'Rule 6(1)(aa)' },
    { key: 'net_quantity', title: 'Net Quantity', rule: 'Rule 6(1)(c)' },
    { key: 'mrp', title: 'Maximum Retail Price (MRP)', rule: 'Rule 6(1)(e)' },
    { key: 'date_of_manufacture_or_pack', title: 'Date of Mfg / Packing', rule: 'Rule 6(1)(d)' },
    { key: 'consumer_care_details', title: 'Consumer Care Details', rule: 'Rule 6(1)(f)' },
    { key: 'unit_sale_price', title: 'Unit Sale Price (USP)', rule: 'Rule 6(1)(g)' },
];

const statusStyles = {
    SUBMITTED: 'bg-[#E9F0FE] text-[#2563EB]',
    PENDING_REVIEW: 'bg-[#E9F0FE] text-[#2563EB]',
    UNDER_REVIEW: 'bg-[#FFF6E5] text-[#B45309]',
    MORE_INFO_REQUIRED: 'bg-[#FFF6E5] text-[#B45309]',
    VERIFIED: 'bg-[#E9F8EF] text-[#16A34A]',
    REJECTED: 'bg-[#FDEAEA] text-[#DC2626]',
    ESCALATED: 'bg-[#FDEAEA] text-[#DC2626]',
    RESOLVED: 'bg-[#DCEEE1] text-[#14532D]',
};

const formatStatus = (status) =>
    (status || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const ComplaintReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [remarksInput, setRemarksInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState('');

    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const sidebarProps = {
        collapsed: sidebarCollapsed,
        onToggleCollapse: () => setSidebarCollapsed((v) => !v),
        mobileOpen: mobileSidebarOpen,
        onCloseMobile: () => setMobileSidebarOpen(false),
    };

    const fetchComplaint = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axiosInstance.get(`/admin/complaints/${id}`);
            setComplaint(res.data.data);
            setRemarksInput(res.data.data?.adminRemarks || '');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load complaint');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    // Whenever this complaint is (or becomes) VERIFIED but not yet escalated,
    // surface the escalate/cancel prompt — both right after verifying and on
    // every subsequent visit, per the spec.
    useEffect(() => {
        if (complaint?.status === 'VERIFIED') {
            setShowEscalateModal(true);
        }
    }, [complaint?.status]);

    const submitReview = async (payload) => {
        setActionError('');
        setSaving(true);
        try {
            const res = await axiosInstance.patch(`/admin/complaints/${id}/review`, payload);
            setComplaint(res.data.data);
            setRemarksInput(res.data.data?.adminRemarks || '');
            return res.data.data;
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to update complaint');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const handleStatusAction = (status) => submitReview({ status, adminRemarks: remarksInput });
    const handleSaveRemarks = () => submitReview({ adminRemarks: remarksInput });

    const handleEscalate = async () => {
        setShowEscalateModal(false);
        await submitReview({ status: 'ESCALATED' });
    };

    const handleCancelEscalate = () => setShowEscalateModal(false);

    const handleGenerateReport = async () => {
    setReportError('');
    setReportLoading(true);
    try {
        const res = await axiosInstance.get(`/complaints/${id}/report`, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
        setReportError('Failed to generate report');
    } finally {
        setReportLoading(false);
    }
};

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#FAFBFA]">
                <AdminSidebar {...sidebarProps} />
                <main className="flex-1 p-8">
                    <div className="mx-auto max-w-[1000px] animate-pulse space-y-4">
                        <div className="h-8 w-64 rounded bg-gray-200" />
                        <div className="h-96 rounded-xl border bg-white" />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="flex min-h-screen bg-[#FAFBFA]">
                <AdminSidebar {...sidebarProps} />
                <main className="flex-1 p-8">
                    <div className="mx-auto max-w-[1000px] rounded-xl border border-[#FDEAEA] bg-[#FDEAEA] p-6 text-[#DC2626]">
                        {error || 'Complaint not found'}
                    </div>
                </main>
            </div>
        );
    }

    const declarations = complaint.analysisSnapshot?.declarations || {};
    const currentImage = complaint.images?.[selectedImage];
    const inspection = complaint.inspection && typeof complaint.inspection === 'object' ? complaint.inspection : null;

    return (
        <div className="flex min-h-screen bg-[#FAFBFA] text-[#101A2E]">
            <AdminSidebar {...sidebarProps} />

            <main className="min-w-0 flex-1 px-5 py-7 sm:px-8">
                <div className="mx-auto max-w-[1000px]">
                    <div className="mb-5 flex items-start gap-3">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="mt-1 shrink-0 rounded-lg border border-[#E4E7EC] bg-white p-2 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex-1">
                            <button
                                onClick={() => navigate('/admin/violations')}
                                className="mb-2 text-sm font-semibold text-[#47536B] hover:text-[#14532D]"
                            >
                                ← Back to Violation Review
                            </button>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-[26px] font-bold tracking-tight">{complaint.complaintId}</h1>
                                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[complaint.status] || 'bg-[#EBECEC] text-[#47536B]'}`}>
                                    {formatStatus(complaint.status)}
                                </span>
                            </div>
                            <p className="mt-1 text-[13.5px] text-[#47536B]">
                                Filed by {complaint.user?.fullName || 'Unknown user'} ({complaint.user?.email || '—'}) on{' '}
                                {new Date(complaint.createdAt).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    {actionError && (
                        <div className="mb-5 rounded-xl border border-[#FDEAEA] bg-[#FDEAEA] p-4 text-sm text-[#DC2626]">
                            {actionError}
                        </div>
                    )}

                    {/* Enforcement case banner */}
                    {/* Enforcement case banner */}
                    {complaint.enforcementCaseId && (
                        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#16A34A]">
                                    Enforcement Case
                                </p>
                                <p className="text-lg font-bold text-[#14532D]">{complaint.enforcementCaseId}</p>
                                {complaint.verifiedAt && (
                                    <p className="mt-0.5 text-xs text-[#47536B]">
                                        Verified {new Date(complaint.verifiedAt).toLocaleString('en-IN')}
                                    </p>
                                )}
                            </div>

                            {complaint.status === 'ESCALATED' ? (
                                <div className="flex flex-col items-start gap-1.5 sm:items-end">
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={reportLoading}
                                        className="rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f4023] disabled:opacity-60"
                                    >
                                        {reportLoading ? 'Generating report…' : 'Generate / View Report'}
                                    </button>
                                    {reportError && <p className="text-xs text-[#DC2626]">{reportError}</p>}
                                    {complaint.reportGeneratedAt && (
                                        <p className="text-xs text-[#47536B]">
                                            Last generated {new Date(complaint.reportGeneratedAt).toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-[#47536B] sm:text-right">
                                    Report generation unlocks once this case is escalated for enforcement.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Evidence */}
                        <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                            <h2 className="mb-3 text-[15px] font-semibold">Evidence</h2>
                            <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#101A2E]">
                                {currentImage ? (
                                    <img
                                        src={currentImage.annotatedImage || currentImage.url}
                                        alt={currentImage.view}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <span className="text-xs text-[#9099A8]">No image</span>
                                )}
                            </div>
                            {complaint.images?.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {complaint.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === idx ? 'border-[#14532D]' : 'border-[#E4E7EC]'
                                                }`}
                                        >
                                            <img src={img.annotatedImage || img.url} alt={img.view} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            {/* Product + inspection info */}
                            <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                                <h2 className="mb-2 text-[15px] font-semibold">Product & Inspection</h2>
                                <p className="text-sm text-[#101A2E]">{complaint.productName || 'Unnamed product'}</p>
                                <p className="text-xs text-[#9099A8]">{complaint.category || 'General'}</p>
                                {complaint.complianceScore != null && (
                                    <p className="mt-1 text-xs text-[#9099A8]">
                                        AI confidence: {Math.round(complaint.complianceScore * 100)}%
                                    </p>
                                )}
                                <div className="mt-3 border-t border-[#E4E7EC] pt-3 text-xs text-[#47536B]">
                                    <p>Inspection ID: {inspection?._id || (typeof complaint.inspection === 'string' ? complaint.inspection : '—')}</p>
                                    {inspection && <p className="mt-1">Inspection status: {formatStatus(inspection.status)}</p>}
                                </div>
                                {complaint.analysisSnapshot?.legal_metrology_2011_compliance?.summary && (
                                    <p className="mt-3 text-xs leading-relaxed text-[#47536B]">
                                        {complaint.analysisSnapshot.legal_metrology_2011_compliance.summary}
                                    </p>
                                )}
                            </div>

                            {/* Violations */}
                            <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                                <h2 className="mb-3 text-[15px] font-semibold">
                                    Violations ({complaint.violations?.length || 0})
                                </h2>
                                {complaint.violations?.length ? (
                                    <ul className="space-y-3">
                                        {complaint.violations.map((v) => (
                                            <li key={v.key} className="border-b border-[#E4E7EC] pb-3 last:border-none last:pb-0">
                                                <p className="text-sm font-medium">
                                                    {v.title} <span className="font-normal text-[#9099A8]">({v.rule})</span>
                                                </p>
                                                <p className="mt-0.5 text-xs text-[#47536B]">{v.reason}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-[#9099A8]">No violations recorded.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Full declarations breakdown */}
                    <div className="mt-5 rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-[15px] font-semibold">Declaration-by-Declaration Breakdown</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] border-collapse text-sm">
                                <thead>
                                    <tr className="text-left text-[11.5px] font-semibold text-[#9099A8]">
                                        <th className="py-2 pr-4">Declaration</th>
                                        <th className="py-2 pr-4">Rule</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2">AI reasoning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DECLARATION_META.map((meta) => {
                                        const item = declarations[meta.key] || {};
                                        const isMissing = item.missing === 'missing';
                                        return (
                                            <tr key={meta.key} className="border-t border-[#E4E7EC]">
                                                <td className="py-2.5 pr-4 font-medium">{meta.title}</td>
                                                <td className="py-2.5 pr-4 text-xs text-[#9099A8]">{meta.rule}</td>
                                                <td className="py-2.5 pr-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${isMissing ? 'bg-[#FDEAEA] text-[#DC2626]' : 'bg-[#E9F8EF] text-[#16A34A]'
                                                            }`}
                                                    >
                                                        {isMissing ? 'Missing' : 'Present'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-xs text-[#47536B]">
                                                    {item.why_missing || item.likely_reason || '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* User description */}
                    {complaint.description && (
                        <div className="mt-5 rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                            <h2 className="mb-2 text-[15px] font-semibold">User's Complaint Description</h2>
                            <p className="text-sm leading-relaxed text-[#47536B]">{complaint.description}</p>
                        </div>
                    )}

                    {/* Admin remarks + actions */}
                    <div className="mt-5 rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                        <h2 className="mb-2 text-[15px] font-semibold">Admin Remarks</h2>
                        <textarea
                            rows={4}
                            value={remarksInput}
                            onChange={(e) => setRemarksInput(e.target.value)}
                            placeholder="Add notes visible to the user about this complaint's review..."
                            className="w-full rounded-lg border border-[#E4E7EC] px-3.5 py-2.5 text-sm focus:border-[#14532D] focus:outline-none"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                onClick={handleSaveRemarks}
                                disabled={saving}
                                className="rounded-lg border border-[#E4E7EC] bg-white px-4 py-2 text-sm font-semibold text-[#101A2E] hover:border-[#14532D] disabled:opacity-60"
                            >
                                Save remarks only
                            </button>
                        </div>

                        <div className="mt-5 border-t border-[#E4E7EC] pt-5">
                            <p className="mb-2.5 text-[12.5px] font-semibold text-[#47536B]">Decision</p>
                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    onClick={() => handleStatusAction('UNDER_REVIEW')}
                                    disabled={saving}
                                    className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    Mark Under Review
                                </button>
                                <button
                                    onClick={() => handleStatusAction('VERIFIED')}
                                    disabled={saving}
                                    className="rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    Verify Complaint
                                </button>
                                <button
                                    onClick={() => handleStatusAction('REJECTED')}
                                    disabled={saving}
                                    className="rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    Reject Complaint
                                </button>
                                <button
                                    onClick={() => handleStatusAction('MORE_INFO_REQUIRED')}
                                    disabled={saving}
                                    className="rounded-lg bg-[#B45309] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    Request More Information
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Escalate / Cancel popup */}
            {showEscalateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-[#101A2E]">Complaint Verified</h3>
                        <p className="mt-2 text-sm text-[#47536B]">
                            Enforcement Case <span className="font-semibold text-[#14532D]">{complaint.enforcementCaseId}</span> has
                            been generated. Do you want to escalate this matter for enforcement action now?
                        </p>
                        <div className="mt-5 flex justify-end gap-2.5">
                            <button
                                onClick={handleCancelEscalate}
                                disabled={saving}
                                className="rounded-lg border border-[#E4E7EC] bg-white px-4 py-2 text-sm font-semibold text-[#101A2E] hover:border-[#14532D] disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEscalate}
                                disabled={saving}
                                className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                            >
                                Escalate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintReview;