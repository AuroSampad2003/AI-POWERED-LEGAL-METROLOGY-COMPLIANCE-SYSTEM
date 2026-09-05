const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="w-6 h-6 border-[2.5px] border-ink-300 border-t-accent-600 rounded-full animate-spin" />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
};

export default Loader;
