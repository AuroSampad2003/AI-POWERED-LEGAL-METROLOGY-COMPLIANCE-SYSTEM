import { useRef, useState } from 'react';

const ImageDropzone = ({ onFilesSelected, disabled, maxFiles, currentCount }) => {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const remaining = maxFiles - currentCount;

  const handleFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length > 0) onFilesSelected(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || remaining <= 0) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && remaining > 0) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl px-4 py-8 sm:py-10 text-center transition-colors duration-150 ${
        isDragging ? 'border-accent-500 bg-accent-50' : 'border-ink-300 bg-ink-100/40'
      } ${disabled || remaining <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="w-10 h-10 rounded-full bg-white border border-ink-200 flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-ink-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 7a2 2 0 012-2h1.5l1-1.5h3l1 1.5H16a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" strokeLinejoin="round" />
          <circle cx="10" cy="10.5" r="2.5" />
        </svg>
      </div>

      <p className="text-sm font-medium text-ink-700">
        {remaining <= 0 ? 'Maximum images reached' : 'Add package images'}
      </p>
      <p className="text-xs text-ink-500 mt-1 mb-4 hidden sm:block">
        Drag and drop, or choose an option below · JPEG, PNG, WEBP · up to {maxFiles} images
      </p>
      <p className="text-xs text-ink-500 mt-1 mb-4 sm:hidden">
        Up to {maxFiles} images · {remaining} remaining
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled || remaining <= 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors duration-150 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 7a2 2 0 012-2h1.17a1 1 0 00.83-.45l.7-1.1A1 1 0 019.5 3h1a1 1 0 01.8.45l.7 1.1a1 1 0 00.83.45H14a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
            <circle cx="10" cy="10.5" r="2" fill="currentColor" stroke="white" strokeWidth="0.5" />
          </svg>
          Take photo
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={disabled || remaining <= 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-white text-ink-700 border border-ink-200 hover:bg-ink-100 transition-colors duration-150 disabled:opacity-50"
        >
          Choose from gallery
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default ImageDropzone;
