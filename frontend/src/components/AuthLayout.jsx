const AuthLayout = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper">
      {/* Identity panel */}
      <div className="lg:w-[42%] bg-ink-900 text-white px-6 sm:px-10 py-10 lg:py-16 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-accent-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 3l7 3.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5L12 3z" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-medium text-ink-200">Legal Metrology Compliance Platform</span>
        </div>

        <div className="my-10 lg:my-0">
          <p className="text-accent-100/80 text-sm font-medium mb-3">{eyebrow}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight max-w-sm">
            {title}
          </h1>
          <p className="text-ink-300 text-[15px] mt-4 max-w-sm leading-relaxed">{subtitle}</p>
        </div>

        <dl className="hidden lg:grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
          <div>
            <dt className="text-xs text-ink-400">Evidence</dt>
            <dd className="text-sm text-ink-100 mt-1">AI-assisted extraction</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-400">Rules</dt>
            <dd className="text-sm text-ink-100 mt-1">Legal Metrology engine</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-400">Decision</dt>
            <dd className="text-sm text-ink-100 mt-1">Human admin review</dd>
          </div>
        </dl>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 lg:py-16">
        <div className="w-full max-w-sm animate-fade-in">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
