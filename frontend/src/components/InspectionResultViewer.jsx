import React, { useState, useEffect } from 'react';

// Global set to cache texts that have completed typing once across tab switches and unmounts
const typedTextCache = new Set();

const AiTypewriterText = ({ text = '', speed = 10, className = '' }) => {
  const isAlreadyTyped = typedTextCache.has(text);

  const [displayed, setDisplayed] = useState(isAlreadyTyped ? text : '');
  const [isTyping, setIsTyping] = useState(!isAlreadyTyped);

  useEffect(() => {
    if (!text || !String(text).trim()) {
      setDisplayed('No context provided for this scan.');
      setIsTyping(false);
      return;
    }

    if (typedTextCache.has(text)) {
      setDisplayed(text);
      setIsTyping(false);
      return;
    }

    setDisplayed('');
    setIsTyping(true);

    let currentLength = 0;
    const timer = setInterval(() => {
      currentLength++;
      if (currentLength <= text.length) {
        setDisplayed(text.slice(0, currentLength));
      } else {
        setIsTyping(false);
        typedTextCache.add(text);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {isTyping && (
        <span className="inline-block w-2.5 h-4.5 ml-1 bg-accent-600 animate-pulse align-middle" />
      )}
    </span>
  );
};

const InspectionResultViewer = ({ inspection, onBack }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [activeTab, setActiveTab] = useState('image');
  const [copiedJson, setCopiedJson] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!inspection) return null;

  const { productName, category, status, createdAt, images = [], analysis = {} } = inspection;

  const currentImage = images[selectedImageIndex] || images[0];
  const compliance = analysis?.legal_metrology_2011_compliance || {};
  const declarations = analysis?.declarations || {};
  const mismatches = analysis?.mismatch_details || [];
  const summary = analysis?.summary || 'No summary available.';
  const context = analysis?.context || 'No product context provided by AI model.';

  const hasAnnotated = Boolean(currentImage?.annotatedImage);
  const imageSrc = showOriginal || !hasAnnotated
    ? currentImage?.url
    : currentImage?.annotatedImage;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const declarationList = [
    {
      key: 'manufacturer_details',
      title: 'Manufacturer / Packer Details',
      rule: 'Rule 6(1)(a)',
      ruleExplanation: 'Requires complete name and official address of the manufacturer, packer, or importer on the packaging.',
      item: declarations.manufacturer_details,
    },
    {
      key: 'country_of_origin',
      title: 'Country of Origin',
      rule: 'Rule 6(1)(aa)',
      ruleExplanation: 'Requires explicit declaration of Country of Origin for imported or manufactured goods (e.g. "Made in India").',
      item: declarations.country_of_origin,
    },
    {
      key: 'net_quantity',
      title: 'Net Quantity',
      rule: 'Rule 6(1)(c)',
      ruleExplanation: 'Requires net weight or volume expressed in standard SI metric units (g, kg, ml, L, N) without non-standard symbols.',
      item: declarations.net_quantity,
      extraKey: 'complies_with_standards',
      extraLabel: 'Standard Metric Compliance',
    },
    {
      key: 'mrp',
      title: 'Maximum Retail Price (MRP)',
      rule: 'Rule 6(1)(e)',
      ruleExplanation: 'Requires retail sale price formatted as "MRP Rs. XX.XX (incl. of all taxes)" inclusive of all applicable taxes.',
      item: declarations.mrp,
      extraKey: 'includes_taxes',
      extraLabel: 'Includes All Taxes Statement',
    },
    {
      key: 'date_of_manufacture_or_pack',
      title: 'Date of Mfg / Packing',
      rule: 'Rule 6(1)(d)',
      ruleExplanation: 'Requires Month and Year (MM/YYYY or DD/MM/YYYY) of manufacturing, packing, or import.',
      item: declarations.date_of_manufacture_or_pack,
    },
    {
      key: 'consumer_care_details',
      title: 'Consumer Care Details',
      rule: 'Rule 6(1)(f)',
      ruleExplanation: 'Requires contact details (Name, Address, Phone No., Email ID) of the officer for consumer complaints.',
      item: declarations.consumer_care_details,
    },
    {
      key: 'unit_sale_price',
      title: 'Unit Sale Price (USP)',
      rule: 'Rule 6(1)(g)',
      ruleExplanation: 'Requires unit price per g, kg, ml, L, or unit to allow fair price comparison across package sizes.',
      item: declarations.unit_sale_price,
    },
  ];

  const presentCount = declarationList.filter((d) => {
    const statusVal = d.item?.missing || (d.item?.present ? 'present' : 'missing');
    return statusVal === 'present';
  }).length;
  const missingCount = declarationList.length - presentCount;
  const isCompliant = compliance?.is_fully_compliant;

  return (
    <div className="w-full text-black py-4 space-y-6 bg-white font-sans">
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm font-semibold text-accent-700 underline cursor-pointer hover:text-accent-600 mb-2 inline-block"
        >
          ← Back to list
        </button>
      )}

      {/* Header & Pure White Summary Metrics */}
      <div className="bg-white space-y-4 border-b border-gray-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-black">
              {productName || 'Inspection Analysis Report'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Category: <span className="font-semibold text-black">{category || 'General'}</span> | Scanned: {new Date(createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-semibold px-3 py-1 bg-white text-black border border-gray-300">
              {status}
            </span>
            <span className={`text-xs uppercase font-bold px-3 py-1 ${
              isCompliant
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
            </span>
          </div>
        </div>

        {/* Clean Pure White Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-white border border-gray-200 rounded">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Rules</p>
            <p className="text-xl font-bold text-black mt-1">7</p>
          </div>
          <div className="p-3 bg-white border border-gray-200 rounded">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</p>
            <p className="text-xl font-bold text-green-600 mt-1">{presentCount}</p>
          </div>
          <div className="p-3 bg-white border border-gray-200 rounded">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Missing</p>
            <p className="text-xl font-bold text-red-600 mt-1">{missingCount}</p>
          </div>
          <div className="p-3 bg-white border border-gray-200 rounded">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Confidence</p>
            <p className="text-xl font-bold text-black mt-1">
              {compliance?.confidence_score !== undefined ? `${Math.round(compliance.confidence_score * 100)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Underline Tab Bar with Accent Color */}
      <div className="flex flex-wrap gap-6 bg-white border-b border-gray-200 px-1">
        <button
          onClick={() => setActiveTab('image')}
          className={`py-3 px-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'image'
              ? 'border-b-2 border-accent-600 text-accent-700'
              : 'border-b-2 border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Annotated Scan & Context View
        </button>
        <button
          onClick={() => setActiveTab('declarations')}
          className={`py-3 px-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'declarations'
              ? 'border-b-2 border-accent-600 text-accent-700'
              : 'border-b-2 border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Declarations Verification ({presentCount}/7)
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`py-3 px-4 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'json'
              ? 'border-b-2 border-accent-600 text-accent-700'
              : 'border-b-2 border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Raw JSON Payload
        </button>
      </div>

      {/* Tab Area Container — Pure White Background */}
      <div className="bg-white min-h-[450px]">

        {/* TAB 1: Side-by-Side Annotated OCR Image & Product Context */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Main Image View (Slides smoothly to Left & Stays) + Stacked Avatar PFP Row */}
            <div className="lg:col-span-7 space-y-4 animate-slide-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-black">Annotated OCR View</h3>
                  <p className="text-xs text-gray-500">Click image to expand full view (PFP style)</p>
                </div>
                {hasAnnotated && (
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-xs font-bold bg-accent-600 text-white px-3 py-1.5 rounded cursor-pointer hover:bg-accent-700 shadow-sm"
                  >
                    {showOriginal ? 'Show Bounding Boxes' : 'Show Original Image'}
                  </button>
                )}
              </div>

              {/* Main Image View Canvas — Clickable PFP style on Pure White */}
              <div
                onClick={() => imageSrc && setLightboxOpen(true)}
                className="bg-white border border-gray-200 flex items-center justify-center p-4 min-h-[380px] w-full relative overflow-hidden transition-all duration-300 rounded cursor-zoom-in group hover:border-accent-600"
                title="Click to view full high-res image"
              >
                {imageSrc ? (
                  <>
                    <img
                      key={selectedImageIndex}
                      src={imageSrc}
                      alt={currentImage?.view || 'Scanned Package View'}
                      className="max-h-[480px] max-w-full object-contain shadow-sm transition-all duration-300 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-accent-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow transition-all">
                        🔍 Click to Expand PFP View
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No image available</p>
                )}
              </div>

              {/* Overlapping PFP Avatar Style Image Stack Deck */}
              {images.length > 1 && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-bold text-black uppercase tracking-wider">
                    Package Image Views ({images.length} stacked image views):
                  </p>
                  
                  {/* Overlapping circular PFP avatars stacked on top of each other */}
                  <div className="flex items-center -space-x-3 overflow-visible py-2">
                    {images.map((img, idx) => {
                      const isSelected = selectedImageIndex === idx;
                      const imgSrcThumb = img.annotatedImage || img.url;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative cursor-pointer transition-all duration-300 transform ${
                            isSelected
                              ? 'z-30 scale-110 ring-4 ring-accent-600 shadow-lg'
                              : 'z-10 opacity-70 hover:opacity-100 hover:scale-105 hover:z-20'
                          }`}
                          title={img.view || `View ${idx + 1}`}
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-white shadow-md flex items-center justify-center">
                            <img
                              src={imgSrcThumb}
                              alt={img.view || `View ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    <span className="text-xs font-semibold text-gray-600 pl-4">
                      Active: <strong className="text-black">{currentImage?.view || `Image ${selectedImageIndex + 1}`}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Product Context & Audit Summary (Pure White Cards with AI Typewriter Response) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-base font-bold text-black uppercase tracking-wide">Product Inspection Context</h3>
                <p className="text-xs text-gray-500 mt-0.5">Context and overall metrology audit summary</p>
              </div>

              {/* Prominent Text Size for Product Overview & Label Context */}
              <div className="bg-white border border-gray-200 p-5 rounded space-y-2">
                <h4 className="font-bold text-sm text-black uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center justify-between">
                  <span>Product Overview & Label Context:</span>
                </h4>
                <p className="text-base text-black leading-relaxed pt-1">
                  <AiTypewriterText text={context} speed={10} />
                </p>
              </div>

              {/* Prominent Text Size for Compliance Audit Summary */}
              <div className="bg-white border border-gray-200 p-5 rounded space-y-2">
                <h4 className="font-bold text-sm text-black uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center justify-between">
                  <span>Compliance Audit Overview:</span>
                </h4>
                <p className="text-base text-black leading-relaxed pt-1">
                  <AiTypewriterText text={summary} speed={10} />
                </p>
              </div>

              {/* Quick Status Breakdown Card */}
              <div className="p-4 space-y-2 text-sm bg-white border border-gray-200 rounded">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Mandatory Rules Compliant:</span>
                  <span className="font-bold text-green-700">{presentCount} / 7</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Mandatory Rules Missing:</span>
                  <span className="font-bold text-red-600">{missingCount} / 7</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Overall Status:</span>
                  <span className={`font-bold uppercase ${
                    isCompliant ? 'text-green-700' : 'text-red-600'
                  }`}>
                    {isCompliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
              </div>

              {/* Extracted OCR Text Drawer */}
              {currentImage?.extractedText && (
                <div className="bg-white border border-gray-200 p-4 rounded text-sm space-y-1.5">
                  <p className="font-bold text-black uppercase tracking-wider">Extracted OCR Text Data:</p>
                  <p className="text-black font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto pr-1">
                    {currentImage.extractedText}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Declarations Verification Table (Classic Table View) */}
        {activeTab === 'declarations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-black">Mandatory Declarations Verification</h3>
                <p className="text-sm text-gray-500 mt-0.5">Legal Metrology (Packaged Commodities) Rules, 2011 Compliance Audit</p>
              </div>
              <span className="text-sm font-bold text-accent-700 bg-accent-50 border border-accent-200 px-3 py-1 rounded">
                {presentCount} / 7 Rules Compliant
              </span>
            </div>

            {/* Classic Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-left border-collapse font-sans text-sm">
                <thead>
                  <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-800 font-bold uppercase tracking-wider text-xs">
                    <th className="p-4 min-w-[220px]">Declaration & Rule Mandate</th>
                    <th className="p-4 w-32 text-center">Status</th>
                    <th className="p-4 min-w-[240px]">Detected Label Text</th>
                    <th className="p-4 min-w-[280px]">What's Missing & Impact / Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {declarationList.map((dec) => {
                    const item = dec.item || {};
                    const statusStr = item.missing || (item.present ? 'present' : (item.present === false ? 'missing' : 'missing'));
                    const detectedText = item.text;
                    const whyMissing = item.why_missing || item.missing_summary;
                    const likelyReason = item.likely_reason;

                    const isPresent = statusStr === 'present';

                    return (
                      <tr key={dec.key} className="hover:bg-gray-50/60 transition-colors">
                        
                        {/* 1. Declaration & Rule */}
                        <td className="p-4 align-top space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-black">{dec.title}</span>
                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              {dec.rule}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {dec.ruleExplanation}
                          </p>
                        </td>

                        {/* 2. Status */}
                        <td className="p-4 align-top text-center">
                          <span className={`inline-block text-xs font-bold px-3 py-1 uppercase rounded ${
                            isPresent
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}>
                            {isPresent ? 'Present' : 'Missing'}
                          </span>
                        </td>

                        {/* 3. Detected Label Text */}
                        <td className="p-4 align-top">
                          {isPresent ? (
                            <div className="space-y-1">
                              {detectedText ? (
                                <p className="text-sm font-semibold text-black leading-relaxed">
                                  "{detectedText}"
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500 italic">Detected on label</p>
                              )}
                              {dec.extraKey && item[dec.extraKey] !== undefined && (
                                <p className="text-xs text-gray-600">
                                  {dec.extraLabel}: <strong className="text-green-700">{item[dec.extraKey] ? 'Compliant' : 'Non-Compliant'}</strong>
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 font-mono">—</span>
                          )}
                        </td>

                        {/* 4. What's Missing & Impact / Cause */}
                        <td className="p-4 align-top space-y-1.5">
                          {isPresent ? (
                            <p className="text-sm text-green-700 font-medium">
                              ✓ Fully compliant with {dec.rule}.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              <p className="text-sm text-red-700 font-semibold leading-relaxed">
                                {whyMissing || `Mandatory declaration under ${dec.rule} is missing or incomplete.`}
                              </p>
                              {likelyReason && (
                                <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-1">
                                  <strong className="text-gray-700">Cause / Recommendation:</strong> {likelyReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Full-Width Raw JSON Data */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black">Raw Analysis JSON Payload</h3>
                <p className="text-xs text-gray-500">Direct response output from AI Legal Metrology model</p>
              </div>
              <button
                onClick={handleCopyJson}
                className="text-xs bg-accent-600 text-white px-4 py-1.5 font-bold rounded cursor-pointer hover:bg-accent-700"
              >
                {copiedJson ? 'Copied to Clipboard' : 'Copy JSON'}
              </button>
            </div>
            <pre className="text-xs font-mono text-black bg-white border border-gray-200 p-4 rounded overflow-x-auto max-h-[600px] leading-relaxed">
              <code>{JSON.stringify(analysis, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox / PFP Style Modal Viewer */}
      {lightboxOpen && imageSrc && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-accent-600 hover:bg-accent-700 px-3 py-1 rounded cursor-pointer"
            >
              ✕ Close PFP View
            </button>
            <img
              src={imageSrc}
              alt={currentImage?.view || 'Full view'}
              className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-xs font-semibold mt-3 text-center bg-accent-600/90 px-4 py-1.5 rounded shadow">
              {currentImage?.view || `Image ${selectedImageIndex + 1}`} ({showOriginal ? 'Original Image' : 'Annotated Bounding Boxes'})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionResultViewer;
