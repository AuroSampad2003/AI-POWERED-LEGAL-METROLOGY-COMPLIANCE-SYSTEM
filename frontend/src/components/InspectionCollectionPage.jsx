import { useEffect, useMemo, useState } from 'react';
import { Calendar, Gauge, Search } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from './DashboardLayout';
import EmptyState from './EmptyState';
import Loader from './Loader';

const InspectionCollectionPage = ({ mode }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const history = mode === 'history';
  const title = history ? 'Compliance history' : 'Saved products';
  const description = history ? 'Review your inspection outcomes and compliance progress over time.' : 'Quickly return to products you have already inspected.';

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axiosInstance.get('/inspections');
        setInspections(response.data?.inspections || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visible = useMemo(() => inspections.filter((item) => `${item.productName} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [inspections, query]);
  const counts = inspections.reduce((result, item) => ({ ...result, [item.status]: (result[item.status] || 0) + 1 }), {});
  const outcomeData = [
    { name: 'Pass', value: counts.COMPLIANT || 0 },
    { name: 'Review', value: counts.NON_COMPLIANT || 0 },
    { name: 'Pending', value: counts.ANALYSIS_PENDING || 0 },
    { name: 'Failed', value: counts.FAILED || 0 },
  ];

  return <DashboardLayout><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10"><div className="mb-6"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">Your activity</p><h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">{title}</h1><p className="mt-1 text-sm text-ink-500">{description}</p></div>{history && <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl border border-ink-200 bg-white p-4"><p className="text-2xl font-semibold text-ink-900">{inspections.length}</p><p className="mt-1 text-xs text-ink-500">Total checks</p></div><div className="rounded-xl border border-ink-200 bg-white p-4"><p className="text-2xl font-semibold text-accent-700">{counts.COMPLIANT || 0}</p><p className="mt-1 text-xs text-ink-500">Compliant</p></div><div className="rounded-xl border border-ink-200 bg-white p-4"><p className="text-2xl font-semibold text-status-fail">{counts.NON_COMPLIANT || 0}</p><p className="mt-1 text-xs text-ink-500">Needs attention</p></div><div className="rounded-xl border border-ink-200 bg-white p-4"><p className="text-2xl font-semibold text-ink-900">{counts.ANALYSIS_PENDING || 0}</p><p className="mt-1 text-xs text-ink-500">Processing</p></div></div><div className="rounded-xl border border-ink-200 bg-white p-4"><p className="text-sm font-semibold text-ink-900">Outcome summary</p><div className="mt-2 h-28"><ResponsiveContainer width="100%" height="100%"><BarChart data={outcomeData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" /><XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" fill="#2F8F59" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div></div>}<div className="relative mb-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product or category" className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-accent-600" /></div>{loading ? <Loader label="Loading inspections..." /> : visible.length === 0 ? <EmptyState title={inspections.length ? 'No matching products' : 'No inspections yet'} message={inspections.length ? 'Try another search term.' : 'Complete an inspection to build your compliance record.'} /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => { const score = item.analysis?.legal_metrology_2011_compliance?.confidence_score; return <article key={item._id} className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-ink-900">{item.productName || 'Unnamed product'}</h2><p className="mt-1 text-xs text-ink-500">{item.category || 'General category'}</p></div><span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">{item.status?.replaceAll('_', ' ') || 'Unknown'}</span></div><div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>{score !== undefined && <span className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" />{Math.round(score * 100)}%</span>}</div></article>; })}</div>}</div></DashboardLayout>;
};

export default InspectionCollectionPage;