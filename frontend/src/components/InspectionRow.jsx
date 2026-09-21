import { Package, Calendar, ChevronRight } from 'lucide-react';
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
      className="group flex cursor-pointer items-center justify-between gap-4 border-b border-ink-100 px-4 py-4 transition-all duration-200 last:border-none hover:bg-accent-50/45 sm:px-5"
    >
      <div className="min-w-0 flex items-center gap-3.5">
        {mainImg?.annotatedImage || mainImg?.url ? (
          <img
            src={mainImg.annotatedImage || mainImg.url}
            alt={inspection.productName || 'Inspection'}
            className="h-12 w-12 shrink-0 rounded-2xl bg-ink-100 object-cover shadow-sm ring-1 ring-black/5 transition-all duration-200 group-hover:scale-105 group-hover:ring-accent-600/30"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-100 text-ink-400 ring-1 ring-black/5">
            <Package className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13.5px] sm:text-sm font-semibold text-ink-800 group-hover:text-accent-600 transition-colors truncate">
            {inspection.productName || 'Unnamed product'}
          </p>
          <p className="flex items-center gap-1 text-xs text-ink-400 mt-0.5">
            <Calendar className="w-3 h-3" strokeWidth={2} />
            {date}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <Badge status={inspection.status} />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-ink-400 transition-all duration-200 group-hover:bg-accent-100 group-hover:text-accent-600">
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" strokeWidth={2.25} />
        </span>
      </div>
    </div>
  );
};

export default InspectionRow;