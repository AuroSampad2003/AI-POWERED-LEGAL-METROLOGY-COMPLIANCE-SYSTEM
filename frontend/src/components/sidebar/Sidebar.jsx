import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  FileWarning,
  History,
  Bookmark,
  HelpCircle,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import SidebarSection from './SidebarSection';
import SidebarLink from './SidebarLink';
import BrandMark from '../ui/BrandMark';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const Sidebar = ({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const bp = useBreakpoint();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const isDesktop = bp === 'desktop';
  const iconOnly = isTablet || (isDesktop && collapsed);

  const widthClass = isMobile ? 'w-72' : iconOnly ? 'w-20' : 'w-64';
  const positionClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : 'sticky top-0 h-screen';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (isMobile) onCloseMobile();
  };

  return (
    <>
      {isMobile && (
        <div
          onClick={onCloseMobile}
          className={`fixed inset-0 bg-ink-900/40 z-40 transition-opacity duration-200 ${
            mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />
      )}

      <aside
        className={`${widthClass} ${positionClass} flex shrink-0 flex-col border-r border-ink-200/80 bg-white/95 shadow-[8px_0_30px_-28px_rgba(16,26,46,0.35)] backdrop-blur-xl transition-[width] duration-300 ease-out`}
      >
        {/* Brand header */}
        <div
          className={`flex h-18 shrink-0 items-center border-b border-ink-100/80 ${
            iconOnly ? 'justify-center px-0' : 'justify-between px-4'
          }`}
        >
          {!iconOnly && (
            <BrandMark
              compact
              textClassName="text-sm text-ink-900"
              iconClassName="bg-accent-600"
            />
          )}

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-xl p-2 text-ink-500 transition-all duration-200 hover:bg-accent-50 hover:text-accent-700"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {isDesktop && (
            <button
              onClick={onToggleCollapse}
              className="rounded-xl p-2 text-ink-400 transition-all duration-200 hover:bg-accent-50 hover:text-accent-700"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-visible py-3">
          <SidebarSection title="Main" iconOnly={iconOnly}>
            <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" iconOnly={iconOnly} onClick={handleLinkClick} />
            <SidebarLink to="/inspection/new" icon={ScanLine} label="Scan / Check Product" iconOnly={iconOnly} highlight onClick={handleLinkClick} />
            <SidebarLink to="/inspections" icon={ClipboardList} label="My Inspections" iconOnly={iconOnly} onClick={handleLinkClick} />
            <SidebarLink to="/complaints" icon={FileWarning} label="My Complaints" iconOnly={iconOnly} onClick={handleLinkClick} />
          </SidebarSection>

          <SidebarSection title="Compliance" iconOnly={iconOnly}>
            <SidebarLink to="/compliance-history" icon={History} label="Compliance History" iconOnly={iconOnly} onClick={handleLinkClick} />
            <SidebarLink to="/saved-products" icon={Bookmark} label="Saved Products" iconOnly={iconOnly} onClick={handleLinkClick} />
          </SidebarSection>

          <SidebarSection title="Support" iconOnly={iconOnly}>
            <SidebarLink to="/help" icon={HelpCircle} label="Help & Guidelines" iconOnly={iconOnly} onClick={handleLinkClick} />
          </SidebarSection>

          <SidebarSection title="Account" iconOnly={iconOnly}>
            <SidebarLink to="/profile" icon={UserCircle} label="Profile" iconOnly={iconOnly} onClick={handleLinkClick} />
            <SidebarLink to="/settings" icon={Settings} label="Settings" iconOnly={iconOnly} onClick={handleLinkClick} />
          </SidebarSection>
        </div>

        {/* Profile footer */}
        <div className={`shrink-0 border-t border-ink-100/80 p-3 ${iconOnly ? 'flex justify-center' : ''}`}>
          {iconOnly ? (
            <button
              onClick={handleLogout}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-accent-500 to-accent-700 text-xs font-bold text-white shadow-md shadow-accent-900/20 transition-transform duration-200 hover:scale-105"
              aria-label="Log out"
            >
              {initials(user?.fullName) || 'U'}
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-ink-900 text-white text-xs font-medium px-2.5 py-1.5 opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50 shadow-lg">
                Log out
              </span>
            </button>
          ) : (
            <div className="-m-1.5 flex items-center gap-2.5 rounded-2xl p-1.5 transition-colors duration-200 hover:bg-accent-50/70">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent-500 to-accent-700 text-xs font-bold text-white shadow-sm">
                {initials(user?.fullName) || 'U'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-ink-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 rounded-xl p-2 text-ink-400 transition-colors duration-200 hover:bg-status-fail-bg hover:text-status-fail"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;