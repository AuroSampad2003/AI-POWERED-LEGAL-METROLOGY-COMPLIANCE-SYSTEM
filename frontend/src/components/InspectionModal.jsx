import React from 'react';
import InspectionResultViewer from './InspectionResultViewer';

const InspectionModal = ({ inspection, isOpen, onClose }) => {
  if (!isOpen || !inspection) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 md:p-10 flex items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-6xl my-auto">
        <InspectionResultViewer inspection={inspection} onClose={onClose} />
      </div>
    </div>
  );
};

export default InspectionModal;
