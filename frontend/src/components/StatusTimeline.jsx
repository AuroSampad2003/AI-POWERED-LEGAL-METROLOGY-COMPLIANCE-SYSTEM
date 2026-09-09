const STAGES = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'OUTCOME', label: 'Outcome' },
    { key: 'ESCALATED', label: 'Escalated' },
    { key: 'RESOLVED', label: 'Closed' },
];

// Maps every real status value onto one of the 5 visual stages above.
const STAGE_INDEX_BY_STATUS = {
    SUBMITTED: 0,
    PENDING_REVIEW: 1,
    UNDER_REVIEW: 1,
    VERIFIED: 2,
    REJECTED: 2,
    MORE_INFO_REQUIRED: 2,
    ESCALATED: 3,
    RESOLVED: 4,
};

const OUTCOME_LABELS = {
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
    MORE_INFO_REQUIRED: 'More Info Required',
};

const StatusTimeline = ({ status }) => {
    const currentIndex = STAGE_INDEX_BY_STATUS[status] ?? 0;

    return (
        <div className="flex items-start">
            {STAGES.map((stage, idx) => {
                const isOutcomeStage = stage.key === 'OUTCOME';
                const label = isOutcomeStage && OUTCOME_LABELS[status] ? OUTCOME_LABELS[status] : stage.label;

                const isDone = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const isFuture = idx > currentIndex;

                const dotClasses = isCurrent
                    ? 'bg-accent-600 ring-4 ring-accent-100'
                    : isDone
                        ? 'bg-accent-600'
                        : 'bg-ink-200';

                const labelClasses = isCurrent
                    ? 'text-ink-900 font-semibold'
                    : isDone
                        ? 'text-ink-600'
                        : 'text-ink-400';

                const lineClasses = idx < currentIndex ? 'bg-accent-600' : 'bg-ink-200';

                return (
                    <div key={stage.key} className={`flex items-center ${idx === STAGES.length - 1 ? '' : 'flex-1'}`}>
                        <div className="flex flex-col items-center gap-1.5 w-20">
                            <span className={`w-3 h-3 rounded-full shrink-0 ${dotClasses}`} />
                            <span className={`text-[11px] text-center leading-tight ${labelClasses}`}>{label}</span>
                        </div>
                        {idx !== STAGES.length - 1 && (
                            <div className={`h-0.5 flex-1 -mt-4 ${lineClasses}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StatusTimeline;