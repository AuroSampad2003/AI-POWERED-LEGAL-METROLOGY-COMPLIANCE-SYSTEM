import { ShieldCheck } from 'lucide-react';

const BrandMark = ({
  className = '',
  compact = false,
  showTagline = false,
  textClassName = '',
  iconClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-accent-600 to-accent-700 text-white shadow-lg shadow-accent-600/20 ${compact ? 'h-8 w-8' : 'h-9 w-9'} ${iconClassName}`}
      >
        <ShieldCheck className={compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <div className={`leading-none font-black tracking-tight ${textClassName || 'text-ink-900'}`}>
          <span className="text-inherit">PackSure</span>
          <span className="ml-1 text-accent-700 italic">AI</span>
        </div>

        {showTagline && (
          <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
            Compliance Intelligence
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandMark;
