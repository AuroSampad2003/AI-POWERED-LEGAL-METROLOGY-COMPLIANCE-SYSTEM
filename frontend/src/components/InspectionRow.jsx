import Badge from './ui/Badge';

const InspectionRow = ({ inspection, onClick }) => {
  const date = new Date(inspection.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const mainImg = inspection.images?.[0];

  return (
    <div
      onClick={() => onClick && onClick(inspection)}
      className="flex items-center justify-between gap-3 py-3.5 px-4 sm:px-5 border-b border-ink-100 last:border-none hover:bg-ink-100/40 cursor-pointer transition-colors duration-150 group"
    >
      <div className="min-w-0 flex items-center gap-3">
        {mainImg?.annotatedImage || mainImg?.url ? (
          <img
            src={mainImg.annotatedImage || mainImg.url}
            alt={inspection.productName || 'Inspection'}
            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-ink-200 shrink-0 group-hover:border-accent/40 transition-colors"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center text-xs text-ink-400 font-mono shrink-0">
            📦
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-800 group-hover:text-accent transition-colors truncate">
            {inspection.productName || 'Unnamed product'}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">{date}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <Badge status={inspection.status} />
        <svg className="w-4 h-4 text-ink-400 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default InspectionRow;
