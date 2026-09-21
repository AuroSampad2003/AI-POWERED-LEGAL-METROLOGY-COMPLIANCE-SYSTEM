import BrandMark from './ui/BrandMark';

const AuthLayout = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,87,0.16),transparent_24%),linear-gradient(135deg,#f1faf4_0%,#ffffff_48%,#edf8f1_100%)] lg:flex-row">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-28 border-accent-100/50" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full border-36 border-emerald-100/45" />
      {/* Identity panel */}
      <div className="relative flex flex-col justify-between bg-ink-900 px-6 py-10 text-white shadow-2xl shadow-ink-900/15 sm:px-10 lg:w-[42%] lg:py-16">
        <BrandMark
          compact
          textClassName="text-sm text-white"
          iconClassName="bg-accent-600"
          className="text-white"
        />

        <div className="my-10 lg:my-0">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-accent-100/80">{eyebrow}</p>
          <h1 className="max-w-sm font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-7 text-ink-300">{subtitle}</p>
        </div>

        <dl className="hidden grid-cols-3 gap-6 border-t border-white/10 pt-8 lg:grid">
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
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
        <div className="w-full max-w-sm animate-fade-in">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
