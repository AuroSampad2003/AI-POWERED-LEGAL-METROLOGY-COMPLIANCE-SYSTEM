const Loader = ({ label = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 animate-fade-in"
    >
      <div className="w-7 h-7 border-[3px] border-ink-200 border-t-accent-600 rounded-full animate-spin" />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
};

export default Loader;