import {
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    FileCheck2,
    SearchCheck,
} from 'lucide-react';

const STAGES = [
    { key: 'SUBMITTED', label: 'Submitted', icon: ClipboardCheck },
    { key: 'UNDER_REVIEW', label: 'Under Review', icon: SearchCheck },
    { key: 'OUTCOME', label: 'Outcome', icon: FileCheck2 },
    { key: 'ESCALATED', label: 'Escalated', icon: AlertTriangle },
    { key: 'RESOLVED', label: 'Closed', icon: CheckCircle2 },
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
        <div className="flex w-full items-start rounded-2xl border border-ink-100 bg-ink-50/45 px-3 py-5 sm:px-5">
            {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isOutcomeStage = stage.key === 'OUTCOME';
                const label =
                    isOutcomeStage && OUTCOME_LABELS[status]
                        ? OUTCOME_LABELS[status]
                        : stage.label;

                const isDone = idx < currentIndex;
                const isCurrent = idx === currentIndex;

                const iconWrapperClasses = isCurrent
                    ? 'bg-accent-600 text-white ring-4 ring-accent-100 shadow-sm'
                    : isDone
                        ? 'bg-accent-600 text-white'
                        : 'bg-ink-100 text-ink-400 border border-ink-200';

                const labelClasses = isCurrent
                    ? 'text-ink-900 font-semibold'
                    : isDone
                        ? 'text-ink-600 font-medium'
                        : 'text-ink-400';

                const lineClasses =
                    idx < currentIndex ? 'bg-accent-600' : 'bg-ink-200';

                return (
                    <div
                        key={stage.key}
                        className={`flex items-center ${
                            idx === STAGES.length - 1 ? '' : 'flex-1'
                        }`}
                    >
                        <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${iconWrapperClasses}`}
                            >
                                <Icon
                                    className="h-4.25 w-4.25"
                                    strokeWidth={isCurrent ? 2.2 : 1.9}
                                />
                            </span>

                            <span
                                className={`text-[11px] text-center leading-tight whitespace-nowrap ${labelClasses}`}
                            >
                                {label}
                            </span>
                        </div>

                        {idx !== STAGES.length - 1 && (
                            <div
                                className={`-mt-6 h-0.5 flex-1 mx-2 rounded-full transition-colors duration-200 sm:mx-3 ${lineClasses}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StatusTimeline;
