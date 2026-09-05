const accentClasses = {
  neutral: 'text-ink-900',
  pass: 'text-status-pass',
  fail: 'text-status-fail',
  warn: 'text-status-warn',
};

const StatCard = ({ label, value, tone = 'neutral', hint }) => {
  return (
    <div className="bg-surface border border-ink-200 rounded-xl px-5 py-4">
      <p className="text-[13px] text-ink-500 font-medium">{label}</p>
      <p className={`font-display text-[34px] leading-tight font-semibold mt-1 ${accentClasses[tone]}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
};

export default StatCard;
