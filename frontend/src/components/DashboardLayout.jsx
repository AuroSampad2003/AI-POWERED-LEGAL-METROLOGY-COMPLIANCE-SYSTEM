import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar/Sidebar';
import useBreakpoint from '../hooks/useBreakpoint';
import BrandMark from './ui/BrandMark';

const DashboardLayout = ({ children }) => {
  const bp = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell min-h-screen flex">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {bp === 'mobile' && (
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-ink-200/80 bg-white/85 px-4 shadow-sm backdrop-blur-xl">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-ink-600 hover:bg-ink-100 transition-colors duration-150"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandMark
              compact
              textClassName="text-sm text-ink-900"
              iconClassName="bg-accent-600"
            />
          </header>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;