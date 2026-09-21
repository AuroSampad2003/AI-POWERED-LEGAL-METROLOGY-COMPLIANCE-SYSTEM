import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandMark from './ui/BrandMark';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/95 text-white shadow-lg shadow-ink-900/10 backdrop-blur-xl">
      <div className="mx-auto flex h-17 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="min-w-0">
          <BrandMark
            compact
            textClassName="text-sm text-white"
            iconClassName="bg-accent-600"
            className="text-white"
          />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="group flex items-center gap-2.5 rounded-full border border-white/10 py-1 pl-1 pr-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent-500 to-accent-700 text-xs font-bold text-white shadow-md shadow-accent-900/30 ring-2 ring-white/10">
              {initials(user?.fullName) || 'U'}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold">{user?.fullName}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-300">{user?.role}</span>
            </span>
            <svg className="w-4 h-4 text-ink-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1.5 text-ink-800 shadow-xl shadow-ink-900/15 animate-fade-in">
              <div className="px-3.5 py-2 border-b border-ink-100 sm:hidden">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-ink-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3.5 py-2.5 text-left text-sm font-semibold text-status-fail transition-colors duration-150 hover:bg-status-fail-bg"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
