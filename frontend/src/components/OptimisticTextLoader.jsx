import React, { useState, useEffect, useMemo } from 'react';

// Randomized phrase banks for 10 sequential Legal Metrology calculation phases
const PHASE_POOLS = [
  [
    "Ingesting package scan & pre-processing label resolution",
    "Initializing image matrix and optimizing contrast levels for clarity",
    "Loading uploaded package imagery into high-speed optical pipeline",
    "Extracting raw image frames for multi-angle OCR scan"
  ],
  [
    "Running PaddleOCR deep neural engine for text polygon detection",
    "Detecting bounding box coordinates and font geometries across label",
    "Scanning text regions across all captured package angles and surface folds",
    "Mapping font heights and character bounding polygons in millimeter scale"
  ],
  [
    "Normalizing extracted character sequences & deskewing package angles",
    "Removing optical noise, reflections, and surface distortion from label",
    "Isolating principal display panel (PDP) from surrounding background elements",
    "Performing super-resolution enhancement on blurry text segments"
  ],
  [
    "Cross-referencing Legal Metrology (Packaged Commodities) Rules 2011",
    "Matching mandatory declaration rule schemas (Rule 6(1)(a) through (g))",
    "Verifying regulatory compliance guidelines for packaged commodity labeling",
    "Structuring extracted OCR tokens against standardized metrology compliance keys"
  ],
  [
    "Executing AI 360-degree legal metrology compliance audit engine",
    "Analyzing net quantity, MRP, manufacturing date & packer declarations",
    "Evaluating declaration completeness, text integrity & missing field causes",
    "Auditing consumer care helpline details and metric unit formatting standards"
  ],
  [
    "Verifying Unit Sale Price (USP) calculations as per 2022 Amendment Rules",
    "Cross-checking mandatory MRP inclusion of all applicable taxes",
    "Validating Country of Origin disclosure for imported & manufactured goods",
    "Auditing complete Manufacturer & Packer name and address declarations"
  ],
  [
    "Checking Date of Manufacture / Packing format compliance (MM/YYYY or DD/MM/YYYY)",
    "Validating Net Quantity expression in standard SI metric units (g, kg, ml, L, N)",
    "Evaluating font size ratios for PDP area against Metrology Schedule II rules",
    "Scanning for misleading statements or non-standard metric symbols"
  ],
  [
    "Performing multi-image cross-validation & angle mismatch analysis",
    "Synthesizing observations across multiple package views for missing information",
    "Reconciling front and back label declarations into unified compliance dataset",
    "Verifying consistency of batch codes and registration identifiers"
  ],
  [
    "Calculating neural confidence scores & generating bounding box coordinate maps",
    "Normalizing compliance status, missing field flags & likely reason diagnostics",
    "Structuring legal metrology violation assessments & remediation guidance",
    "Consolidating 360-degree inspection report & spatial polygon metadata"
  ],
  [
    "Finalizing Legal Metrology compliance verdict and summary highlights",
    "Preparing interactive visual result viewer with clickable image region tags",
    "Structuring official inspection report certificate for download",
    "Wrapping up automated audit analysis — almost ready..."
  ]
];

const OptimisticTextLoader = ({ images = [] }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [shuffleIndex, setShuffleIndex] = useState(0);

  // Pick a unique random step text combination from each phase pool on every submission
  const randomSteps = useMemo(() => {
    return PHASE_POOLS.map(pool => pool[Math.floor(Math.random() * pool.length)]);
  }, [images]);

  // Cycle active phase step text every ~3.5s to 5s so each text stays for a long amount of time
  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 1500) + 3500;
    const timer = setTimeout(() => {
      setActiveStepIndex((prev) => (prev + 1) % randomSteps.length);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, [activeStepIndex, randomSteps.length]);

  // Image shuffle animation interval when images.length > 1
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const shuffleTimer = setInterval(() => {
      setShuffleIndex((prev) => (prev + 1) % images.length);
    }, 2200);

    return () => clearInterval(shuffleTimer);
  }, [images]);

  const currentStepText = randomSteps[activeStepIndex] || "Calculating compliance...";

  return (
    <div className="my-8 bg-white text-black text-center font-sans space-y-6 max-w-xl mx-auto py-6">
      
      {/* Image Preview & Multi-Image Card Shuffle Deck */}
      {images.length > 0 && (
        <div className="relative w-full max-w-sm mx-auto aspect-4/3 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-4 min-h-[240px]">
          {images.length === 1 ? (
            <img
              src={images[0].preview}
              alt="Uploaded package preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {images.map((img, idx) => {
                const offset = (idx - shuffleIndex + images.length) % images.length;
                const isTop = offset === 0;

                let styleClasses = "absolute max-h-[200px] max-w-[80%] object-contain transition-all duration-500 ease-in-out rounded shadow-md border border-gray-300 bg-white p-1";
                if (isTop) {
                  styleClasses += " z-30 scale-100 rotate-0 opacity-100 translate-y-0";
                } else if (offset === 1) {
                  styleClasses += " z-20 scale-95 rotate-3 opacity-80 translate-x-3 translate-y-2";
                } else if (offset === 2) {
                  styleClasses += " z-10 scale-90 -rotate-3 opacity-60 -translate-x-3 translate-y-4";
                } else {
                  styleClasses += " z-0 scale-85 rotate-0 opacity-0 translate-y-6";
                }

                return (
                  <img
                    key={img.id || idx}
                    src={img.preview}
                    alt={`Package view ${idx + 1}`}
                    className={styleClasses}
                  />
                );
              })}
              
              {/* Badge */}
              <span className="absolute bottom-2 right-2 bg-accent-600 text-white text-[11px] font-bold px-3 py-1 rounded shadow-sm z-40 uppercase tracking-wide">
                Calculating...
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3 Dots Moving Like a Wave */}
      <div className="flex items-center justify-center gap-2.5 py-2">
        <span className="w-3.5 h-3.5 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-3.5 h-3.5 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-3.5 h-3.5 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Single Dynamic Active Calculation Step Text with smooth transition */}
      <div className="px-4 min-h-[56px] flex items-center justify-center">
        <p key={activeStepIndex} className="text-base font-semibold text-black leading-relaxed animate-fade-in">
          {currentStepText}
        </p>
      </div>

    </div>
  );
};

export default OptimisticTextLoader;
