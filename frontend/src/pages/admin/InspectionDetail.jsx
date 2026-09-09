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
    UPLOADED: 'bg-[#EBECEC] text-[#47536B]',
    ANALYSIS_PENDING: 'bg-[#E9F0FE] text-[#2563EB]',
    ANALYZED: 'bg-[#FFF6E5] text-[#B45309]',
    COMPLIANT: 'bg-[#E9F8EF] text-[#16A34A]',
    NON_COMPLIANT: 'bg-[#FDEAEA] text-[#DC2626]',
    FAILED: 'bg-[#FDEAEA] text-[#DC2626]',
};

// Same presence check used across InspectionResultViewer, the admin
// complaint table, and the PDF report — kept identical here deliberately.
const isDeclarationPresent = (item = {}) => {
    const statusVal = item.missing || (item.present ? 'present' : 'missing');
    return statusVal === 'present';
};

const formatStatus = (status) =>
    (status || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const InspectionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState('');

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const sidebarProps = {
        collapsed: sidebarCollapsed,
        onToggleCollapse: () => setSidebarCollapsed((v) => !v),
        mobileOpen: mobileSidebarOpen,
        onCloseMobile: () => setMobileSidebarOpen(false),
    };

    const fetchInspection = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axiosInstance.get(`/admin/inspections/${id}`);
            setInspection(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load inspection');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInspection();
    }, [id]);

    const handleStatusChange = async (status) => {
        setActionError('');
        setSaving(true);
        try {
            const res = await axiosInstance.patch(`/admin/inspections/${id}/status`, { status });
            setInspection(res.data.data);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setSaving(false);
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

    if (error || !inspection) {
        return (
            <div className="flex min-h-screen bg-[#FAFBFA]">
                <AdminSidebar {...sidebarProps} />
                <main className="flex-1 p-8">
                    <div className="mx-auto max-w-[1000px] rounded-xl border border-[#FDEAEA] bg-[#FDEAEA] p-6 text-[#DC2626]">
                        {error || 'Inspection not found'}
                    </div>
                </main>
            </div>
        );
    }

    const declarations = inspection.analysis?.declarations || {};
    const compliance = inspection.analysis?.legal_metrology_2011_compliance || {};
    const currentImage = inspection.images?.[selectedImage];
    const presentCount = DECLARATION_META.filter((m) => isDeclarationPresent(declarations[m.key])).length;

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
                                onClick={() => navigate('/admin/inspections')}
                                className="mb-2 text-sm font-semibold text-[#47536B] hover:text-[#14532D]"
                            >
                                ← Back to Inspection Management
                            </button>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-[26px] font-bold tracking-tight">
                                    {inspection.productName || 'Unnamed product'}
                                </h1>
                                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[inspection.status] || 'bg-[#EBECEC] text-[#47536B]'}`}>
                                    {formatStatus(inspection.status)}
                                </span>
                            </div>
                            <p className="mt-1 text-[13.5px] text-[#47536B]">
                                Submitted by {inspection.user?.fullName || 'Unknown user'} ({inspection.user?.email || '—'}) on{' '}
                                {new Date(inspection.createdAt).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    {actionError && (
                        <div className="mb-5 rounded-xl border border-[#FDEAEA] bg-[#FDEAEA] p-4 text-sm text-[#DC2626]">
                            {actionError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Images */}
                        <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                            <h2 className="mb-3 text-[15px] font-semibold">Package Images</h2>
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
                            {inspection.images?.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {inspection.images.map((img, idx) => (
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
                            <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                                <h2 className="mb-2 text-[15px] font-semibold">AI Analysis Summary</h2>
                                <p className="text-sm text-[#101A2E]">{inspection.category || 'General'}</p>
                                <div className="mt-3 flex flex-wrap gap-4 border-t border-[#E4E7EC] pt-3 text-xs text-[#47536B]">
                                    <span>Declarations checked: {DECLARATION_META.length}</span>
                                    <span>Present: {presentCount}</span>
                                    <span>Missing: {DECLARATION_META.length - presentCount}</span>
                                    {compliance?.confidence_score !== undefined && (
                                        <span>AI confidence: {Math.round(compliance.confidence_score * 100)}%</span>
                                    )}
                                </div>
                                {compliance?.summary && (
                                    <p className="mt-3 text-xs leading-relaxed text-[#47536B]">{compliance.summary}</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                                <h2 className="mb-2 text-[15px] font-semibold">Override Status</h2>
                                <p className="mb-3 text-xs text-[#9099A8]">
                                    Use this only to manually correct an inspection's status if the AI pipeline mis-classified it.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['COMPLIANT', 'NON_COMPLIANT', 'ANALYZED', 'FAILED'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusChange(s)}
                                            disabled={saving || inspection.status === s}
                                            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition disabled:opacity-40 ${statusStyles[s] || 'bg-[#EBECEC] text-[#47536B]'}`}
                                        >
                                            {formatStatus(s)}
                                        </button>
                                    ))}
                                </div>
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
                                        <th className="py-2">Detected Text / Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DECLARATION_META.map((meta) => {
                                        const item = declarations[meta.key] || {};
                                        const present = isDeclarationPresent(item);
                                        return (
                                            <tr key={meta.key} className="border-t border-[#E4E7EC]">
                                                <td className="py-2.5 pr-4 font-medium">{meta.title}</td>
                                                <td className="py-2.5 pr-4 text-xs text-[#9099A8]">{meta.rule}</td>
                                                <td className="py-2.5 pr-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${present ? 'bg-[#E9F8EF] text-[#16A34A]' : 'bg-[#FDEAEA] text-[#DC2626]'
                                                            }`}
                                                    >
                                                        {present ? 'Present' : 'Missing'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-xs text-[#47536B]">
                                                    {present ? item.text || '—' : item.why_missing || item.likely_reason || '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InspectionDetail;