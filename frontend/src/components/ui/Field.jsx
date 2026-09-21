const Field = ({ label, htmlFor, error, children, hint }) => {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-ink-600"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-ink-500 mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-status-fail mt-1.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0V7zm-.75 6.5a.875.875 0 100-1.75.875.875 0 000 1.75z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export const inputClasses = (hasError) =>
    `w-full rounded-xl border bg-white/90 px-3.5 py-3 text-sm text-ink-800 shadow-sm shadow-ink-900/[0.02] placeholder:text-ink-400 transition-all duration-200 focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent-500/10 ${
    hasError ? 'border-status-fail focus:ring-status-fail/10' : 'border-ink-200 hover:border-accent-300'
  }`;

export default Field;
