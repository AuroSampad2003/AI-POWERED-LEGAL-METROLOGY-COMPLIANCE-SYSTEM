const Loader = ({ label = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in"
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-accent-100" />
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-accent-600" />
        <span className="absolute h-2 w-2 rounded-full bg-accent-600" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">{label}</p>
    </div>
  );
};

export default Loader;