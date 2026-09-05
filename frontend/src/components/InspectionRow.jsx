import Badge from './ui/Badge';

const InspectionRow = ({ inspection }) => {
  const date = new Date(inspection.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between gap-3 py-3.5 px-4 sm:px-5 border-b border-ink-100 last:border-none hover:bg-ink-100/40 transition-colors duration-150">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-800 truncate">
          {inspection.productName || 'Unnamed product'}
        </p>
        <p className="text-xs text-ink-500 mt-0.5">{date}</p>
      </div>
      <Badge status={inspection.status} />
    </div>
  );
};

export default InspectionRow;
