const Field = ({ label, htmlFor, error, children, hint }) => {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-ink-700 mb-1.5"
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
  `w-full px-3.5 py-2.5 text-[15px] bg-white border rounded-lg text-ink-800 placeholder:text-ink-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 ${
    hasError ? 'border-status-fail' : 'border-ink-200 hover:border-ink-300'
  }`;

export default Field;
