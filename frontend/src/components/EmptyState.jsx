const EmptyState = ({ title = 'Nothing here yet', message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-11 h-11 rounded-full bg-ink-100 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-ink-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="14" height="12" rx="1.5" />
          <path d="M3 8h14" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {message && <p className="text-sm text-ink-500 mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
