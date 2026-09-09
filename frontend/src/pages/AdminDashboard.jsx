import { useEffect, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    // --- sidebar state (this was missing before, which caused the auto-hide) ---
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const fetchDashboard = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const response = await axiosInstance.get('/admin/dashboard');

            if (response.data?.success) {
                setStats(response.data.data);
            } else {
                setError(
                    response.data?.message || 'Failed to load dashboard'
                );
            }
        } catch (err) {
            console.error('Dashboard error:', err);

            setError(
                err.response?.data?.message ||
                'Unable to load dashboard'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashboard();
    }, []);

    const totalCompleted =
        (stats?.compliant || 0) + (stats?.nonCompliant || 0);

    const complianceRate = useMemo(() => {
        if (!totalCompleted) return 0;

        return Math.round(
            ((stats?.compliant || 0) / totalCompleted) * 100
        );
    }, [stats, totalCompleted]);

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatStatus = (status) => {
        if (!status) return 'Unknown';

        return status
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'COMPLIANT':
                return 'bg-[#E9F8EF] text-[#16A34A]';

            case 'NON_COMPLIANT':
                return 'bg-[#FDEAEA] text-[#DC2626]';

            case 'ANALYSIS_PENDING':
            case 'UPLOADED':
                return 'bg-[#E9F0FE] text-[#2563EB]';

            case 'FAILED':
                return 'bg-[#EBECEC] text-[#47536B]';

            case 'ANALYZED':
                return 'bg-[#DCEEE1] text-[#14532D]';

            default:
                return 'bg-[#EBECEC] text-[#47536B]';
        }
    };

    // Shared sidebar props so every branch (loading / error / loaded)
    // wires the sidebar up the same way.
    const sidebarProps = {
        collapsed: sidebarCollapsed,
        onToggleCollapse: () => setSidebarCollapsed((v) => !v),
        mobileOpen: mobileSidebarOpen,
        onCloseMobile: () => setMobileSidebarOpen(false),
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#FAFBFA] text-[#101A2E]">
                <AdminSidebar {...sidebarProps} />

                <main className="min-w-0 flex-1 px-5 py-7 sm:px-8">
                    <div className="mx-auto max-w-[1200px] animate-pulse space-y-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileSidebarOpen(true)}
                                className="rounded-lg border border-[#E4E7EC] bg-white p-2 lg:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="h-4 w-28 rounded bg-gray-200" />
                        </div>
                        <div className="h-8 w-64 rounded bg-gray-200" />
                        <div className="h-4 w-96 rounded bg-gray-200" />

                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-32 rounded-xl border bg-white"
                                />
                            ))}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                            <div className="h-96 rounded-xl border bg-white" />
                            <div className="h-96 rounded-xl border bg-white" />
                        </div>

                        <div className="h-80 rounded-xl border bg-white" />
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-[#FAFBFA]">
                <AdminSidebar {...sidebarProps} />

                <main className="min-w-0 flex-1 p-8">
                    <div className="mx-auto max-w-[1200px]">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="mb-4 rounded-lg border border-[#E4E7EC] bg-white p-2 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="rounded-xl border border-[#FDEAEA] bg-[#FDEAEA] p-6">
                            <h2 className="text-lg font-semibold text-[#DC2626]">
                                Unable to load dashboard
                            </h2>

                            <p className="mt-1 text-sm text-[#DC2626]">
                                {error}
                            </p>

                            <button
                                onClick={() => fetchDashboard()}
                                className="mt-4 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total users',
            value: stats?.totalUsers || 0,
            sub: 'Registered users',
            type: 'users',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="9" cy="7" r="3.2" />
                    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                    <circle cx="17.5" cy="7.5" r="2.3" />
                </svg>
            ),
        },
        {
            label: 'Total inspections',
            value: stats?.totalInspections || 0,
            sub: 'All inspections',
            type: 'inspect',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 3h9l4 4v14H6z" />
                    <path d="M9 10h7M9 14h7M9 18h4" />
                </svg>
            ),
        },
        {
            label: 'Compliant',
            value: stats?.compliant || 0,
            sub: 'Passed inspections',
            type: 'compliant',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 12.5l5 5L20 6.5" />
                </svg>
            ),
        },
        {
            label: 'Non-compliant',
            value: stats?.nonCompliant || 0,
            sub: 'Failed compliance',
            type: 'noncompliant',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            ),
        },
        {
            label: 'Pending',
            value: stats?.pending || 0,
            sub: 'Awaiting analysis',
            type: 'pending',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3 2" />
                </svg>
            ),
        },
        {
            label: 'Failed',
            value: stats?.failed || 0,
            sub: 'Processing failed',
            type: 'failed',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 3l9 16H3z" />
                    <path d="M12 10v4M12 17v.1" />
                </svg>
            ),
        },
    ];

    const iconStyles = {
        users: 'bg-[#DCEEE1] text-[#14532D]',
        inspect: 'bg-[#DCEEE1] text-[#14532D]',
        compliant: 'bg-[#E9F8EF] text-[#16A34A]',
        noncompliant: 'bg-[#FDEAEA] text-[#DC2626]',
        pending: 'bg-[#E9F0FE] text-[#2563EB]',
        failed: 'bg-[#EBECEC] text-[#47536B]',
    };

    return (
        <div className="flex min-h-screen bg-[#FAFBFA] text-[#101A2E]">
            <AdminSidebar {...sidebarProps} />

            <main className="min-w-0 flex-1 px-5 py-7 sm:px-8">
                <div className="mx-auto max-w-[1200px]">

                    {/* HEADER */}
                    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            {/* Mobile menu button — opens the sidebar; nothing did this before */}
                            <button
                                onClick={() => setMobileSidebarOpen(true)}
                                className="mt-1 shrink-0 rounded-lg border border-[#E4E7EC] bg-white p-2 lg:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <div>
                                <div className="mb-1.5 text-[13px] font-semibold text-[#14532D]">
                                    Administration
                                </div>

                                <h1 className="text-[28px] font-bold tracking-tight">
                                    Admin dashboard
                                </h1>

                                <p className="mt-1 text-[14.5px] text-[#47536B]">
                                    Monitor users, inspections, and product compliance.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-lg bg-[#DCEEE1] px-2.5 py-1 text-xs font-semibold text-[#14532D]">
                                        Administrator
                                    </span>

                                    <span className="rounded-lg bg-[#EBECEC] px-2.5 py-1 text-xs font-semibold text-[#47536B]">
                                        Rule set v2026.3
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchDashboard(true)}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#101A2E] shadow-sm transition hover:border-[#14532D] disabled:opacity-60"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''
                                        }`}
                                >
                                    <path d="M4 4v6h6M20 20v-6h-6" />
                                    <path d="M5.5 9A7 7 0 0 1 19 9M18.5 15a7 7 0 0 1-13.5 0" />
                                </svg>

                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>

                            <button
                                className="rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4023]"
                            >
                                Export report
                            </button>
                        </div>
                    </div>

                    {/* STAT CARDS */}
                    <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-xl border border-[#E4E7EC] bg-white p-4 shadow-sm"
                            >
                                <div className="mb-2.5 flex items-center justify-between">
                                    <span className="text-[12.5px] font-semibold text-[#47536B]">
                                        {card.label}
                                    </span>

                                    <span
                                        className={`flex h-[26px] w-[26px] items-center justify-center rounded-[7px] ${iconStyles[card.type]}`}
                                    >
                                        <span className="h-3.5 w-3.5">
                                            {card.icon}
                                        </span>
                                    </span>
                                </div>

                                <div className="text-[26px] font-bold leading-none tracking-tight">
                                    {card.value.toLocaleString()}
                                </div>

                                <div className="mt-1 text-xs text-[#9099A8]">
                                    {card.sub}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MIDDLE SECTION */}
                    <div className="mb-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">

                        {/* COMPLIANCE OVERVIEW */}
                        <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h2 className="text-[15px] font-semibold">
                                        Compliance overview
                                    </h2>

                                    <p className="mt-0.5 text-[12.5px] text-[#47536B]">
                                        Share of completed inspections that passed
                                    </p>
                                </div>

                                <div className="text-right">
                                    <div className="text-[30px] font-bold leading-none text-[#14532D]">
                                        {complianceRate}%
                                    </div>

                                    <div className="mt-1 text-[11.5px] text-[#9099A8]">
                                        of {totalCompleted} completed
                                    </div>
                                </div>
                            </div>

                            {/* BAR */}
                            <div className="mb-4 flex h-2.5 overflow-hidden rounded-md bg-[#EBECEC]">
                                <div
                                    className="h-full bg-[#16A34A] transition-all duration-500"
                                    style={{
                                        width: `${complianceRate}%`,
                                    }}
                                />

                                <div
                                    className="h-full bg-[#DC2626] transition-all duration-500"
                                    style={{
                                        width: `${100 - complianceRate}%`,
                                    }}
                                />
                            </div>

                            {/* LEGEND */}
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                <div className="rounded-lg bg-[#E9F8EF] p-2.5">
                                    <div className="text-[11.5px] font-semibold text-[#16A34A]">
                                        Compliant
                                    </div>
                                    <div className="mt-1 text-lg font-bold text-[#16A34A]">
                                        {stats?.compliant || 0}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-[#FDEAEA] p-2.5">
                                    <div className="text-[11.5px] font-semibold text-[#DC2626]">
                                        Non-compliant
                                    </div>
                                    <div className="mt-1 text-lg font-bold text-[#DC2626]">
                                        {stats?.nonCompliant || 0}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-[#E9F0FE] p-2.5">
                                    <div className="text-[11.5px] font-semibold text-[#2563EB]">
                                        Pending
                                    </div>
                                    <div className="mt-1 text-lg font-bold text-[#2563EB]">
                                        {stats?.pending || 0}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-[#EBECEC] p-2.5">
                                    <div className="text-[11.5px] font-semibold text-[#47536B]">
                                        Failed
                                    </div>
                                    <div className="mt-1 text-lg font-bold text-[#47536B]">
                                        {stats?.failed || 0}
                                    </div>
                                </div>
                            </div>

                            {/* VIOLATION CATEGORIES */}
                            <div className="mt-7">
                                <div className="mb-4">
                                    <h2 className="text-[15px] font-semibold">
                                        Top violation categories
                                    </h2>

                                    <p className="mt-0.5 text-[12.5px] text-[#47536B]">
                                        Most frequent findings across non-compliant inspections
                                    </p>
                                </div>

                                {[
                                    ['Missing MRP declaration', 0],
                                    ['Country of origin absent', 0],
                                    ['Consumer care incomplete', 0],
                                    ['Net quantity format', 0],
                                    ['Manufacturer info illegible', 0],
                                ].map(([label, count]) => (
                                    <div
                                        key={label}
                                        className="mb-2.5 flex items-center gap-2.5"
                                    >
                                        <span className="w-[150px] shrink-0 text-[12.5px] text-[#101A2E]">
                                            {label}
                                        </span>

                                        <div className="h-2 flex-1 overflow-hidden rounded bg-[#EBECEC]">
                                            <div
                                                className="h-full rounded bg-[#DC2626]"
                                                style={{ width: `${count}%` }}
                                            />
                                        </div>

                                        <span className="w-6 text-right text-[12.5px] font-bold text-[#47536B]">
                                            {count}
                                        </span>
                                    </div>
                                ))}

                                <p className="mt-3 text-[11px] text-[#9099A8]">
                                    Violation analytics will populate when detailed rule findings
                                    are available from the inspection analysis.
                                </p>
                            </div>
                        </div>

                        {/* SYSTEM SUMMARY */}
                        <div className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-[15px] font-semibold">
                                    System summary
                                </h2>

                                <p className="mt-0.5 text-[12.5px] text-[#47536B]">
                                    Current platform activity
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between border-b border-[#E4E7EC] py-2.5 text-[13.5px]">
                                    <span className="text-[#47536B]">
                                        Registered users
                                    </span>

                                    <span className="font-semibold">
                                        {stats?.totalUsers || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#E4E7EC] py-2.5 text-[13.5px]">
                                    <span className="text-[#47536B]">
                                        Inspections
                                    </span>

                                    <span className="font-semibold">
                                        {stats?.totalInspections || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#E4E7EC] py-2.5 text-[13.5px]">
                                    <span className="text-[#47536B]">
                                        Successful analysis
                                    </span>

                                    <span className="font-semibold text-[#16A34A]">
                                        {totalCompleted}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#E4E7EC] py-2.5 text-[13.5px]">
                                    <span className="text-[#47536B]">
                                        Awaiting analysis
                                    </span>

                                    <span className="font-semibold text-[#2563EB]">
                                        {stats?.pending || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#E4E7EC] py-2.5 text-[13.5px]">
                                    <span className="text-[#47536B]">
                                        Active rule version
                                    </span>

                                    <span className="font-semibold">
                                        v2026.3
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2.5 text-[13.5px]">
                                    <span className="text-[#47536B]">
                                        Platform status
                                    </span>

                                    <span className="font-semibold text-[#16A34A]">
                                        Operational
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT INSPECTIONS */}
                    <div className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5">
                            <div>
                                <h2 className="text-[15px] font-semibold">
                                    Recent inspections
                                </h2>

                                <p className="mt-0.5 text-[12.5px] text-[#47536B]">
                                    Latest product compliance inspections
                                </p>
                            </div>

                            <span className="text-[12.5px] font-semibold text-[#14532D]">
                                Showing latest {stats?.recentInspections?.length || 0}
                            </span>
                        </div>

                        {stats?.recentInspections?.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] border-collapse">
                                    <thead>
                                        <tr className="border-t border-[#E4E7EC] bg-[#FAFBFA]">
                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">
                                                Product
                                            </th>

                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">
                                                Category
                                            </th>

                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">
                                                User
                                            </th>

                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">
                                                Status
                                            </th>

                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">
                                                Date
                                            </th>

                                            <th className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-[#9099A8]">
                                                Evidence
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {stats.recentInspections.map((inspection) => (
                                            <tr
                                                key={inspection._id}
                                                className="border-t border-[#E4E7EC] transition hover:bg-[#FAFBFA]"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="text-[13.5px] font-semibold">
                                                        {inspection.productName ||
                                                            'Unnamed product'}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 text-xs text-[#9099A8]">
                                                    {inspection.category || '—'}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="text-[13.5px] font-semibold">
                                                        {inspection.user?.fullName ||
                                                            'Unknown user'}
                                                    </div>

                                                    <div className="text-xs text-[#9099A8]">
                                                        {inspection.user?.email || '—'}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                                            inspection.status
                                                        )}`}
                                                    >
                                                        {inspection.status === 'COMPLIANT' && (
                                                            <span>✓</span>
                                                        )}

                                                        {inspection.status === 'NON_COMPLIANT' && (
                                                            <span>×</span>
                                                        )}

                                                        {(inspection.status ===
                                                            'ANALYSIS_PENDING' ||
                                                            inspection.status ===
                                                            'UPLOADED') && (
                                                                <span>◷</span>
                                                            )}

                                                        {formatStatus(inspection.status)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-[13px] text-[#47536B]">
                                                    {formatDate(inspection.createdAt)}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#14532D] hover:underline"
                                                    >
                                                        View report

                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            className="h-3 w-3"
                                                        >
                                                            <path d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex min-h-[260px] items-center justify-center border-t border-[#E4E7EC]">
                                <div className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBECEC] text-[#9099A8]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            className="h-6 w-6"
                                        >
                                            <path d="M6 3h9l4 4v14H6z" />
                                            <path d="M14 3v5h5" />
                                        </svg>
                                    </div>

                                    <p className="mt-3 text-sm font-semibold">
                                        No inspections yet
                                    </p>

                                    <p className="mt-1 text-xs text-[#9099A8]">
                                        Recent product inspections will appear here.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;