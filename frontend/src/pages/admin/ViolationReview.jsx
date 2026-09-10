import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/admin/AdminSidebar';

const TABS = [
    { key: 'ALL', label: 'All', statuses: null },
    { key: 'PENDING', label: 'Pending / Submitted', statuses: ['SUBMITTED', 'PENDING_REVIEW'] },
    { key: 'UNDER_REVIEW', label: 'Under Review', statuses: ['UNDER_REVIEW'] },
    { key: 'VERIFIED', label: 'Verified', statuses: ['VERIFIED'] },
    { key: 'REJECTED', label: 'Rejected', statuses: ['REJECTED'] },
    { key: 'ESCALATED', label: 'Escalated', statuses: ['ESCALATED'] },
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
    (status || 'Unknown')
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

const ViolationReview = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const sidebarProps = {
        collapsed: sidebarCollapsed,
        onToggleCollapse: () => setSidebarCollapsed((v) => !v),
        mobileOpen: mobileSidebarOpen,
        onCloseMobile: () => setMobileSidebarOpen(false),
    };

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axiosInstance.get('/admin/complaints');
            setComplaints(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const filtered = useMemo(() => {
        const tab = TABS.find((t) => t.key === activeTab);
        if (!tab?.statuses) return complaints;
        return complaints.filter((c) => tab.statuses.includes(c.status));
    }, [complaints, activeTab]);

    return (
        <div className="flex min-h-screen bg-[#FAFBFA] text-[#101A2E]">
            <AdminSidebar {...sidebarProps} />

            <main className="min-w-0 flex-1 px-5 py-7 sm:px-8">
                <div className="mx-auto max-w-[1200px]">
                    <div className="mb-6 flex items-start gap-3">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="mt-1 shrink-0 rounded-lg border border-[#E4E7EC] bg-white p-2 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <div className="mb-1.5 text-[13px] font-semibold text-[#14532D]">Compliance</div>
                            <h1 className="text-[28px] font-bold tracking-tight">Violation Review</h1>
                            <p className="mt-1 text-[14.5px] text-[#47536B]">
                                Complaints raised by users that need admin review and a decision.
                            </p>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="mb-5 flex flex-wrap gap-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold transition ${activeTab === tab.key
                                        ? 'bg-[#14532D] text-white'
                                        : 'border border-[#E4E7EC] bg-white text-[#47536B] hover:border-[#14532D]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-[#FDEAEA] bg-[#FDEAEA] p-4 text-sm text-[#DC2626]">
                            {error}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
                        {loading ? (
                            <div className="p-8">
                                <div className="animate-pulse space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-14 rounded-lg bg-gray-100" />
                                    ))}
                                </div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex min-h-[220px] items-center justify-center">
                                <div className="text-center">
                                    <p className="text-sm font-semibold">No complaints in this view</p>
                                    <p className="mt-1 text-xs text-[#9099A8]">Try a different filter.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] border-collapse">
                                    <thead>
                                        <tr className="border-t border-[#E4E7EC] bg-[#FAFBFA]">
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Complaint</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Product</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Violations</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">AI result</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Submitted</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Status</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((c) => {
                                            const mainViolation = c.violations?.[0];
                                            const extraCount = (c.violations?.length || 0) - 1;
                                            return (
                                                <tr key={c._id} className="border-t border-[#E4E7EC] hover:bg-[#FAFBFA]">
                                                    <td className="px-5 py-3.5">
                                                        <div className="text-[13.5px] font-semibold">{c.complaintId}</div>
                                                        <div className="text-xs text-[#9099A8]">
                                                            Inspection: {typeof c.inspection === 'string' ? c.inspection : c.inspection?._id}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="text-[13.5px] font-semibold">{c.productName || 'Unnamed product'}</div>
                                                        <div className="text-xs text-[#9099A8]">{c.category || 'General'}</div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="text-[13.5px] font-semibold">{c.violations?.length || 0} total</div>
                                                        {mainViolation && (
                                                            <div className="text-xs text-[#9099A8]">
                                                                {mainViolation.title}
                                                                {extraCount > 0 ? ` +${extraCount} more` : ''}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#47536B]">
                                                        {c.complianceScore != null ? `${Math.round(c.complianceScore * 100)}% confidence` : '—'}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#47536B]">{formatDate(c.createdAt)}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[c.status] || 'bg-[#EBECEC] text-[#47536B]'}`}>
                                                            {formatStatus(c.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <button
                                                            onClick={() => navigate(`/admin/violations/${c._id}`)}
                                                            className="rounded-lg bg-[#14532D] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0f4023]"
                                                        >
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ViolationReview;