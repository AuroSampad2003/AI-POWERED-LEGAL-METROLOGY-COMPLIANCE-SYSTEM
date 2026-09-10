import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/admin/AdminSidebar';

const TABS = [
    { key: 'ALL', label: 'All', statuses: null },
    { key: 'PENDING', label: 'Pending', statuses: ['UPLOADED', 'ANALYSIS_PENDING'] },
    { key: 'ANALYZED', label: 'Analyzed', statuses: ['ANALYZED'] },
    { key: 'COMPLIANT', label: 'Compliant', statuses: ['COMPLIANT'] },
    { key: 'NON_COMPLIANT', label: 'Non-Compliant', statuses: ['NON_COMPLIANT'] },
    { key: 'FAILED', label: 'Failed', statuses: ['FAILED'] },
];

const statusStyles = {
    UPLOADED: 'bg-[#EBECEC] text-[#47536B]',
    ANALYSIS_PENDING: 'bg-[#E9F0FE] text-[#2563EB]',
    ANALYZED: 'bg-[#FFF6E5] text-[#B45309]',
    COMPLIANT: 'bg-[#E9F8EF] text-[#16A34A]',
    NON_COMPLIANT: 'bg-[#FDEAEA] text-[#DC2626]',
    FAILED: 'bg-[#FDEAEA] text-[#DC2626]',
};

const formatStatus = (status) =>
    (status || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const InspectionManagement = () => {
    const navigate = useNavigate();
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const sidebarProps = {
        collapsed: sidebarCollapsed,
        onToggleCollapse: () => setSidebarCollapsed((v) => !v),
        mobileOpen: mobileSidebarOpen,
        onCloseMobile: () => setMobileSidebarOpen(false),
    };

    const fetchInspections = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axiosInstance.get('/admin/inspections');
            setInspections(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load inspections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInspections();
    }, []);

    const filtered = useMemo(() => {
        const tab = TABS.find((t) => t.key === activeTab);
        let list = inspections;
        if (tab?.statuses) {
            list = list.filter((i) => tab.statuses.includes(i.status));
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (i) =>
                    i.productName?.toLowerCase().includes(q) ||
                    i.category?.toLowerCase().includes(q) ||
                    i.user?.fullName?.toLowerCase().includes(q) ||
                    i.user?.email?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [inspections, activeTab, searchQuery]);

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
                            <div className="mb-1.5 text-[13px] font-semibold text-[#14532D]">Inspections</div>
                            <h1 className="text-[28px] font-bold tracking-tight">Inspection Management</h1>
                            <p className="mt-1 text-[14.5px] text-[#47536B]">
                                Every product scan submitted across the platform.
                            </p>
                        </div>
                    </div>

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
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

                        <input
                            type="text"
                            placeholder="Search product, category or user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-[#E4E7EC] bg-white px-3.5 py-2 text-sm focus:border-[#14532D] focus:outline-none sm:w-72"
                        />
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
                                    <p className="text-sm font-semibold">No inspections found</p>
                                    <p className="mt-1 text-xs text-[#9099A8]">Try a different filter or search.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] border-collapse">
                                    <thead>
                                        <tr className="border-t border-[#E4E7EC] bg-[#FAFBFA]">
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Product</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Submitted By</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">AI Result</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Scanned</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">Status</th>
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((i) => {
                                            const score = i.analysis?.legal_metrology_2011_compliance?.confidence_score;
                                            return (
                                                <tr key={i._id} className="border-t border-[#E4E7EC] hover:bg-[#FAFBFA]">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#101A2E]">
                                                                {i.images?.[0] && (
                                                                    <img
                                                                        src={i.images[0].annotatedImage || i.images[0].url}
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-[13.5px] font-semibold">{i.productName || 'Unnamed product'}</div>
                                                                <div className="text-xs text-[#9099A8]">{i.category || 'General'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="text-[13.5px] font-semibold">{i.user?.fullName || '—'}</div>
                                                        <div className="text-xs text-[#9099A8]">{i.user?.email || '—'}</div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#47536B]">
                                                        {score != null ? `${Math.round(score * 100)}% confidence` : '—'}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#47536B]">{formatDate(i.createdAt)}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[i.status] || 'bg-[#EBECEC] text-[#47536B]'}`}>
                                                            {formatStatus(i.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <button
                                                            onClick={() => navigate(`/admin/inspections/${i._id}`)}
                                                            className="rounded-lg bg-[#14532D] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0f4023]"
                                                        >
                                                            View
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

export default InspectionManagement;