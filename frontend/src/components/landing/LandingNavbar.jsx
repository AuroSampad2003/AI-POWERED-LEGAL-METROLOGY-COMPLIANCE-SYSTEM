import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle the glass effect once the page has scrolled past the hero edge.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-500 ease-out ${
        scrolled
          ? 'bg-surface/70 backdrop-blur-xl border-b border-ink-100/70 shadow-[0_8px_30px_-12px_rgba(16,26,46,0.15)]'
          : 'bg-transparent border-b border-transparent shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-100 text-accent-600 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3">
              <ShieldCheck className="w-5 h-5" strokeWidth={2.25} />
            </span>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-accent-700">PackSure</span>{' '}
              <span className="text-ink-900">AI</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative px-4 py-2 text-sm font-medium text-ink-700 transition-colors duration-200 hover:text-accent-700"
              >
                {link.label}
                <span className="pointer-events-none absolute left-4 right-4 -bottom-0.5 h-[2px] origin-center scale-x-0 rounded-full bg-accent-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-700 transition-all duration-200 hover:bg-accent-50 hover:text-accent-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-md"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 transition-colors duration-200 hover:bg-accent-50 hover:text-accent-700 md:hidden"
          >
            <span className="relative block h-5 w-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  mobileOpen ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  mobileOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 border-t border-ink-100/70 bg-surface/90 px-6 py-4 backdrop-blur-xl">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ transitionDelay: mobileOpen ? `${i * 40}ms` : '0ms' }}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-all duration-300 hover:bg-accent-50 hover:text-accent-700 ${
                mobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex items-center gap-3 border-t border-ink-100 pt-3">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-center text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-accent-50 hover:text-accent-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-700"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;