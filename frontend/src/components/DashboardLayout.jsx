import { useState } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import Sidebar from './sidebar/Sidebar';
import useBreakpoint from '../hooks/useBreakpoint';

const DashboardLayout = ({ children }) => {
  const bp = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {bp === 'mobile' && (
          <header className="h-14 bg-white border-b border-ink-200 flex items-center gap-3 px-4 sticky top-0 z-30 shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-ink-600 hover:bg-ink-100 transition-colors duration-150"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-accent-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-ink-900 truncate">LM Compliance</span>
            </div>
          </header>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
