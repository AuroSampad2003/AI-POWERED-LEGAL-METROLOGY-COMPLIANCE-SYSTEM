const statusMap = {
  ANALYSIS_PENDING: { label: 'Analysis pending', color: 'pending' },
  UPLOADED: { label: 'Uploaded', color: 'pending' },
  ANALYZED: { label: 'Analyzed', color: 'pending' },
  COMPLIANT: { label: 'Compliant', color: 'pass' },
  NON_COMPLIANT: { label: 'Non-compliant', color: 'fail' },
  PENDING_REVIEW: { label: 'Pending review', color: 'pending' },
  UNDER_REVIEW: { label: 'Under review', color: 'pending' },
  MORE_INFO_REQUIRED: { label: 'More info required', color: 'warn' },
  VERIFIED: { label: 'Verified', color: 'pass' },
  REJECTED: { label: 'Rejected', color: 'fail' },
  ESCALATED: { label: 'Escalated', color: 'warn' },
  RESOLVED: { label: 'Resolved', color: 'pass' },
};

const colorClasses = {
  pass: 'bg-status-pass-bg text-status-pass',
  fail: 'bg-status-fail-bg text-status-fail',
  warn: 'bg-status-warn-bg text-status-warn',
  pending: 'bg-status-pending-bg text-status-pending',
};

const dotClasses = {
  pass: 'bg-status-pass',
  fail: 'bg-status-fail',
  warn: 'bg-status-warn',
  pending: 'bg-status-pending',
};

const Badge = ({ status }) => {
  const entry = statusMap[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', color: 'pending' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${colorClasses[entry.color]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[entry.color]}`} />
      {entry.label}
    </span>
  );
};

export default Badge;
