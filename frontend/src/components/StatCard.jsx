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
    <div className="bg-surface-raised border border-ink-200 rounded-xl px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] text-ink-500 font-medium leading-tight">{label}</p>
        {Icon && (
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${chipClasses[tone]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
          </span>
        )}
      </div>
      <p className={`font-display text-[34px] leading-tight font-semibold mt-1 ${accentClasses[tone]}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
};

export default StatCard;