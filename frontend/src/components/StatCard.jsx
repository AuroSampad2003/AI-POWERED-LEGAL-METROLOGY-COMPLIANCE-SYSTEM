const accentClasses = {
  neutral: 'text-ink-900',
  pass: 'text-status-pass',
  fail: 'text-status-fail',
  warn: 'text-status-warn',
};

const chipClasses = {
  neutral: 'bg-accent-100 text-accent-700',
  pass: 'bg-status-pass-bg text-status-pass',
  fail: 'bg-status-fail-bg text-status-fail',
  warn: 'bg-status-warn-bg text-status-warn',
};

const StatCard = ({ label, value, tone = 'neutral', hint, icon: Icon }) => {
  return (
    <div className="surface-card interactive-lift rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] text-ink-500 font-medium leading-tight">{label}</p>
        {Icon && (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${chipClasses[tone]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
          </span>
        )}
      </div>
      <p className={`font-display mt-2 text-[34px] font-semibold leading-tight ${accentClasses[tone]}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
};

export default StatCard;