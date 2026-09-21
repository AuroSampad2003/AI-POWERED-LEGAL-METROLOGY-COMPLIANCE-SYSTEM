import React from 'react';
import InspectionResultViewer from './InspectionResultViewer';

const InspectionModal = ({ inspection, isOpen, onClose }) => {
  if (!isOpen || !inspection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-900/75 p-3 backdrop-blur-md animate-fade-in sm:p-6 md:p-10">
      <div className="relative my-auto w-full max-w-6xl animate-slide-up">
        <InspectionResultViewer inspection={inspection} onClose={onClose} />
      </div>
    </div>
  );
};

export default InspectionModal;
