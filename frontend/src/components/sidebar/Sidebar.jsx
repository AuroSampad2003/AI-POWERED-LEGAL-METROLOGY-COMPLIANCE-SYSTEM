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
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import SidebarSection from './SidebarSection';
import SidebarLink from './SidebarLink';

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
        className={`${widthClass} ${positionClass} bg-white border-r border-ink-200 flex flex-col shrink-0 transition-[width] duration-200 ease-out`}
      >
        {/* Brand header */}
        <div
          className={`h-16 flex items-center border-b border-ink-100 shrink-0 ${
            iconOnly ? 'justify-center px-0' : 'justify-between px-4'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-accent-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            {!iconOnly && (
              <span className="text-sm font-semibold text-ink-900 truncate">LM Compliance</span>
            )}
          </div>

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-md text-ink-500 hover:bg-ink-100 transition-colors duration-150"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {isDesktop && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors duration-150"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-visible py-1">
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
        <div className={`border-t border-ink-100 p-3 shrink-0 ${iconOnly ? 'flex justify-center' : ''}`}>
          {iconOnly ? (
            <button
              onClick={handleLogout}
              className="group relative w-10 h-10 rounded-full bg-accent-600 text-white text-xs font-semibold flex items-center justify-center hover:bg-accent-700 transition-colors duration-150"
              aria-label="Log out"
            >
              {initials(user?.fullName) || 'U'}
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-ink-900 text-white text-xs font-medium px-2.5 py-1.5 opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50 shadow-lg">
                Log out
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-accent-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {initials(user?.fullName) || 'U'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                <p className="text-[11px] text-accent-600 font-medium mt-0.5">
                  {user?.role === 'ADMIN' ? 'Role: Admin' : 'Role: Consumer / User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-ink-400 hover:text-status-fail hover:bg-status-fail-bg transition-colors duration-150 shrink-0"
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
