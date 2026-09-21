import { useState } from 'react';
import { Bell, Eye, Settings2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const Settings = () => {
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [compactReports, setCompactReports] = useState(false);

  return <DashboardLayout><div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10"><div className="mb-6"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">Account</p><h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">Settings</h1><p className="mt-1 text-sm text-ink-500">Manage your notification and report preferences.</p></div><div className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm"><div className="flex items-start justify-between gap-4 p-5"><div className="flex gap-3"><Bell className="mt-0.5 h-5 w-5 text-accent-700" /><div><h2 className="font-semibold text-ink-900">Email updates</h2><p className="mt-1 text-sm text-ink-500">Receive status updates when an inspection or complaint changes.</p></div></div><input type="checkbox" checked={emailUpdates} onChange={(event) => setEmailUpdates(event.target.checked)} className="mt-1 h-4 w-4 accent-accent-600" aria-label="Email updates" /></div><div className="flex items-start justify-between gap-4 p-5"><div className="flex gap-3"><Eye className="mt-0.5 h-5 w-5 text-accent-700" /><div><h2 className="font-semibold text-ink-900">Compact reports</h2><p className="mt-1 text-sm text-ink-500">Use denser report summaries when reviewing inspection results.</p></div></div><input type="checkbox" checked={compactReports} onChange={(event) => setCompactReports(event.target.checked)} className="mt-1 h-4 w-4 accent-accent-600" aria-label="Compact reports" /></div><div className="flex gap-3 bg-ink-50/60 p-5"><Settings2 className="mt-0.5 h-5 w-5 text-ink-500" /><p className="text-sm leading-6 text-ink-500">These preferences apply immediately in this browser. Account-wide preference syncing can be connected when the backend settings endpoint is introduced.</p></div></div></div></DashboardLayout>;
};

export default Settings;
