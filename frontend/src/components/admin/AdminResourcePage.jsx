import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import AdminDashboardLayout from './AdminDashboardLayout';
import EmptyState from '../EmptyState';
import Loader from '../Loader';

const pageInfo = {
  analytics: ['Analytics', 'View inspection, compliance, and system performance analytics.'],
  inspections: ['Inspections', 'Review and manage product inspections submitted by users.'],
  products: ['Products', 'Manage inspected products and their compliance information.'],
  violations: ['Violation Review', 'Review detected compliance violations and inspection findings.'],
  rules: ['Rule Administration', 'Manage the active Legal Metrology compliance checklist.'],
  settings: ['Settings', 'Configure administrative and platform settings.'],
};

const formatStatus = (status = '') => status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const AdminResourcePage = ({ type }) => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(!['rules', 'settings'].includes(type));
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (['rules', 'settings'].includes(type)) return;
    const load = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'analytics' ? '/admin/dashboard' : type === 'violations' ? '/admin/complaints' : '/admin/inspections';
        const response = await axiosInstance.get(endpoint);
        if (type === 'analytics') {
          setStats(response.data?.data);
          setItems(response.data?.data?.recentInspections || []);
        } else {
          setItems(response.data?.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || `Unable to load ${type}.`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const searchable = `${item.productName || ''} ${item.category || ''} ${item.title || ''} ${item.user?.fullName || ''}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (status === 'ALL' || item.status === status);
  }), [items, query, status]);

  const updateStatus = async (item, nextStatus) => {
    try {
      await axiosInstance.patch(`/admin/inspections/${item._id}/status`, { status: nextStatus });
      setItems((current) => current.map((entry) => entry._id === item._id ? { ...entry, status: nextStatus } : entry));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update inspection status.');
    }
  };

  const [title, description] = pageInfo[type];
  const statCards = [
    ['Users', stats?.totalUsers, Users],
    ['Inspections', stats?.totalInspections, FileText],
    ['Compliant', stats?.compliant, CheckCircle2],
    ['Non-compliant', stats?.nonCompliant, XCircle],
    ['Pending', stats?.pending, Clock3],
  ];
  const outcomeData = [
    { name: 'Compliant', value: stats?.compliant || 0, color: '#16A34A' },
    { name: 'Non-compliant', value: stats?.nonCompliant || 0, color: '#DC2626' },
    { name: 'Pending', value: stats?.pending || 0, color: '#2563EB' },
    { name: 'Failed', value: stats?.failed || 0, color: '#64748B' },
  ];
  const recentData = filteredItems.map((item, index) => ({
    name: item.productName?.slice(0, 12) || `Item ${index + 1}`,
    value: item.status === 'COMPLIANT' ? 1 : 0,
  }));

  const renderAnalytics = () => (
    loading ? <Loader label="Loading analytics..." /> : (
      <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map(([label, value, Icon]) => (
            <div key={label} className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
              <Icon className="h-5 w-5 text-accent-700" />
              <p className="mt-4 text-2xl font-semibold text-ink-900">{value || 0}</p>
              <p className="mt-1 text-xs text-ink-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent-700" /><h2 className="font-semibold text-ink-900">Recent activity</h2></div>
          {filteredItems.length ? <div className="mt-3 divide-y divide-ink-100">{filteredItems.map((item) => <div key={item._id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium text-ink-800">{item.productName || 'Unnamed product'}</span><span className="text-ink-500">{item.user?.fullName || 'Unknown user'}</span><span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">{formatStatus(item.status)}</span></div>)}</div> : <EmptyState title="No recent activity" message="Activity will appear after inspections are submitted." />}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Outcome distribution</h2>
            <p className="mt-1 text-xs text-ink-500">Current inspection results by status.</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3} stroke="none">
                    {outcomeData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-ink-500">{outcomeData.map((entry) => <span key={entry.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}: <strong className="text-ink-800">{entry.value}</strong></span>)}</div>
          </div>
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Recent compliance signal</h2>
            <p className="mt-1 text-xs text-ink-500">Compliant results among the latest inspections.</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} domain={[0, 1]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Compliant" fill="#16A34A" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </>
    )
  );

  const renderList = () => (
    loading ? <Loader label={`Loading ${title.toLowerCase()}...`} /> : (
      <>
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${type}...`} className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-600" /></div>
          {type !== 'products' && <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"><option value="ALL">All statuses</option><option value="COMPLIANT">Compliant</option><option value="NON_COMPLIANT">Non-compliant</option><option value="ANALYSIS_PENDING">Pending</option></select>}
        </div>
        {filteredItems.length === 0 ? <EmptyState title={`No ${type} found`} message="Try changing your search or filters." /> : <div className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">{filteredItems.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold text-ink-900">{item.productName || item.title || 'Unnamed item'}</p><p className="mt-1 text-xs text-ink-500">{item.category || item.user?.fullName || 'General'}{item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString('en-IN')}` : ''}</p></div><div className="flex items-center gap-2">{item.status && <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">{formatStatus(item.status)}</span>}{type === 'inspections' && <select value={item.status} onChange={(event) => updateStatus(item, event.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs"><option value="UPLOADED">Uploaded</option><option value="ANALYSIS_PENDING">Pending</option><option value="ANALYZED">Analyzed</option><option value="COMPLIANT">Compliant</option><option value="NON_COMPLIANT">Non-compliant</option><option value="FAILED">Failed</option></select>}{type === 'products' && <Package className="h-4 w-4 text-accent-700" />}</div></div>)}</div>}
      </>
    )
  );

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">Administration</p><h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">{title}</h1><p className="mt-1 text-sm text-ink-500">{description}</p></div>
        {error && <div className="mb-5 rounded-lg border border-status-fail/20 bg-status-fail-bg px-4 py-3 text-sm text-status-fail">{error}</div>}
        {type === 'settings' && <section className="max-w-2xl rounded-xl border border-ink-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-ink-900">Inspection processing</h2><p className="mt-1 text-sm text-ink-500">Allow new submissions to be processed by the OCR service.</p></div><button type="button" onClick={() => setEnabled((value) => !value)} className={`relative h-6 w-11 rounded-full ${enabled ? 'bg-accent-600' : 'bg-ink-300'}`} aria-label="Toggle inspection processing"><span className={`absolute top-1 h-4 w-4 rounded-full bg-white ${enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button></div></section>}
        {type === 'rules' && <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm"><SlidersHorizontal className="h-5 w-5 text-accent-700" /><h2 className="mt-4 font-semibold text-ink-900">Pack declarations</h2><p className="mt-1 text-sm leading-6 text-ink-500">Manufacturer, importer, country of origin, quantity, MRP, and consumer-care details.</p><span className="mt-4 inline-flex rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">Active</span></div><div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm"><ShieldCheck className="h-5 w-5 text-accent-700" /><h2 className="mt-4 font-semibold text-ink-900">Legal Metrology 2011</h2><p className="mt-1 text-sm leading-6 text-ink-500">The compliance engine evaluates label evidence against the declaration checklist.</p><span className="mt-4 inline-flex rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">Enabled</span></div></div>}
        {type === 'analytics' && renderAnalytics()}
        {['inspections', 'products', 'violations'].includes(type) && renderList()}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminResourcePage;
