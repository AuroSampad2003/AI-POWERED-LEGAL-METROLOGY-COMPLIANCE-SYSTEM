const DefaultIcon = () => (
  <svg className="w-5 h-5 text-ink-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="14" height="12" rx="1.5" />
    <path d="M3 8h14" strokeLinecap="round" />
  </svg>
);

const EmptyState = ({ title = 'Nothing here yet', message, action, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-100 bg-accent-50 shadow-inner shadow-accent-100/70">
        {Icon ? <Icon className="w-5 h-5 text-ink-400" strokeWidth={1.75} /> : <DefaultIcon />}
      </div>
      <p className="text-sm font-bold text-ink-800">{title}</p>
      {message && <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;