const viewOptions = ['FRONT', 'BACK', 'SIDE', 'OTHER'];

const ImageThumbnail = ({ image, onRemove, onViewChange }) => {
  return (
    <div className="relative bg-surface border border-ink-200 rounded-lg overflow-hidden group">
      <div className="aspect-square bg-ink-100">
        <img src={image.preview} alt="Product preview" className="w-full h-full object-cover" />
      </div>

      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink-900/70 text-white flex items-center justify-center hover:bg-status-fail transition-colors duration-150"
        aria-label="Remove image"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>

      <select
        value={image.view}
        onChange={(e) => onViewChange(image.id, e.target.value)}
        className="w-full text-xs font-medium text-ink-700 bg-white border-t border-ink-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent-500"
      >
        {viewOptions.map((v) => (
          <option key={v} value={v}>
            {v.charAt(0) + v.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ImageThumbnail;
