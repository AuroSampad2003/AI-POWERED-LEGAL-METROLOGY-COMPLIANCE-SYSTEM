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
      className="flex items-center justify-between gap-4 py-4 px-4 sm:px-5 border-b border-ink-100 last:border-none hover:bg-surface cursor-pointer transition-colors duration-150 group"
    >
      <div className="min-w-0 flex items-center gap-3.5">
        {mainImg?.annotatedImage || mainImg?.url ? (
          <img
            src={mainImg.annotatedImage || mainImg.url}
            alt={inspection.productName || 'Inspection'}
            className="w-12 h-12 rounded-xl object-cover bg-ink-100 ring-1 ring-black/5 shadow-sm shrink-0 group-hover:ring-accent-600/30 transition-all duration-150"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-ink-100 ring-1 ring-black/5 flex items-center justify-center text-ink-400 shrink-0">
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
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-ink-400 bg-ink-100 group-hover:bg-accent-100 group-hover:text-accent-600 transition-colors duration-150">
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" strokeWidth={2.25} />
        </span>
      </div>
    </div>
  );
};

export default InspectionRow;