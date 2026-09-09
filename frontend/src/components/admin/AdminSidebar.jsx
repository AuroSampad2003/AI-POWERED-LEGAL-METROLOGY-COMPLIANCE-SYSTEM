import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ClipboardCheck,
  Package,
  AlertTriangle,
  Users,
  SlidersHorizontal,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import SidebarSection from '../sidebar/SidebarSection';
import SidebarLink from '../sidebar/SidebarLink';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const AdminSidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const bp = useBreakpoint();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const isDesktop = bp === 'desktop';

  const iconOnly = isTablet || (isDesktop && collapsed);

  const widthClass = isMobile
    ? 'w-72'
    : iconOnly
      ? 'w-20'
      : 'w-64';

  const positionClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out ${
        mobileOpen
          ? 'translate-x-0'
          : '-translate-x-full'
      }`
    : 'sticky top-0 h-screen';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div
          onClick={onCloseMobile}
          className={`fixed inset-0 z-40 bg-ink-900/40 transition-opacity duration-200 ${
            mobileOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
        />
      )}

      <aside
        className={`${widthClass} ${positionClass} flex shrink-0 flex-col border-r border-ink-200 bg-white transition-[width] duration-200 ease-out`}
      >
        {/* =====================================================
            BRAND HEADER
        ====================================================== */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-ink-100 ${
            iconOnly
              ? 'justify-center px-0'
              : 'justify-between px-4'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Logo */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-600">
              <ShieldCheck
                className="h-[18px] w-[18px] text-white"
                strokeWidth={2}
              />
            </div>

            {/* Brand name */}
            {!iconOnly && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">
                  LM Compliance
                </p>

                <p className="truncate text-[10px] font-medium text-ink-400">
                  Administration
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-ink-500 transition-colors duration-150 hover:bg-ink-100"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Desktop collapse */}
          {isDesktop && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="rounded-md p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-600"
              aria-label={
                collapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <div className="flex-1 overflow-y-auto overflow-x-visible py-1">
          
          {/* OVERVIEW */}
          <SidebarSection
            title="Overview"
            iconOnly={iconOnly}
          >
            <SidebarLink
              to="/admin/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />

            <SidebarLink
              to="/admin/analytics"
              icon={BarChart3}
              label="Analytics"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />
          </SidebarSection>

          {/* COMPLIANCE */}
          <SidebarSection
            title="Compliance"
            iconOnly={iconOnly}
          >
            <SidebarLink
              to="/admin/inspections"
              icon={ClipboardCheck}
              label="Inspections"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />

            <SidebarLink
              to="/admin/products"
              icon={Package}
              label="Products"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />

            <SidebarLink
              to="/admin/violations"
              icon={AlertTriangle}
              label="Violation Review"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />
          </SidebarSection>

          {/* SYSTEM */}
          <SidebarSection
            title="System"
            iconOnly={iconOnly}
          >
            <SidebarLink
              to="/admin/users"
              icon={Users}
              label="Users"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />

            <SidebarLink
              to="/admin/rules"
              icon={SlidersHorizontal}
              label="Rule Administration"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />

            <SidebarLink
              to="/admin/settings"
              icon={Settings}
              label="Settings"
              iconOnly={iconOnly}
              onClick={handleLinkClick}
            />
          </SidebarSection>
        </div>

        {/* =====================================================
            ADMIN PROFILE FOOTER
        ====================================================== */}
        <div
          className={`shrink-0 border-t border-ink-100 p-3 ${
            iconOnly ? 'flex justify-center' : ''
          }`}
        >
          {iconOnly ? (
            /* Collapsed / Tablet */
            <button
              type="button"
              onClick={handleLogout}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-700"
              aria-label="Log out"
            >
              {initials(user?.fullName) || 'A'}

              <span className="pointer-events-none absolute left-full z-50 ml-2 origin-left scale-95 whitespace-nowrap rounded-md bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
                Log out
              </span>
            </button>
          ) : (
            /* Expanded */
            <div className="flex items-center gap-2.5">
              
              {/* Avatar */}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
                {initials(user?.fullName) || 'A'}
              </span>

              {/* User information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-800">
                  {user?.fullName || 'Administrator'}
                </p>

                <p className="truncate text-xs text-ink-500">
                  {user?.email || 'Admin account'}
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-accent-600">
                  Administrator
                </p>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-md p-1.5 text-ink-400 transition-colors duration-150 hover:bg-status-fail-bg hover:text-status-fail"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;