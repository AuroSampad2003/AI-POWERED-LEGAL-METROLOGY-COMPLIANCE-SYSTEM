import { Link, useLocation } from 'react-router-dom';

const SidebarLink = ({ to, icon: Icon, label, iconOnly, highlight, onClick }) => {
  const location = useLocation();
  const active = location.pathname === to;

  const base = 'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150';
  const padding = iconOnly ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5';

  const tone = highlight
    ? 'bg-accent-600 text-white hover:bg-accent-700'
    : active
    ? 'bg-accent-50 text-accent-700'
    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800';

  return (
    <Link to={to} onClick={onClick} className={`${base} ${padding} ${tone}`}>
      {!highlight && active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-600 rounded-r" />
      )}

      <Icon
        className={`w-[18px] h-[18px] shrink-0 ${
          highlight ? 'text-white' : active ? 'text-accent-600' : 'text-ink-400 group-hover:text-ink-600'
        }`}
        strokeWidth={1.75}
      />

      {!iconOnly && <span className="truncate">{label}</span>}

      {iconOnly && (
        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-ink-900 text-white text-xs font-medium px-2.5 py-1.5 opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50 shadow-lg">
          {label}
        </span>
      )}
    </Link>
  );
};

export default SidebarLink;
