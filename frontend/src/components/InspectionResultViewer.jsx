import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  //Copy,
  FileCheck2,
  //FileJson2,
  Image as ImageIcon,
  Maximize2,
  PackageCheck,
  //RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
  //ZoomIn,
} from 'lucide-react';

// Global set to cache texts that have completed typing once across tab switches and unmounts
const typedTextCache = new Set();

const AiTypewriterText = ({ text = '', speed = 10, className = '' }) => {
  const isAlreadyTyped = typedTextCache.has(text);

  const [displayed, setDisplayed] = useState(isAlreadyTyped ? text : '');
  const [isTyping, setIsTyping] = useState(!isAlreadyTyped);

  useEffect(() => {
    if (!text || !String(text).trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();

  const { productName, category, status, createdAt, images = [], analysis = {} } = inspection;

  const currentImage = images[selectedImageIndex] || images[0];
  const compliance = analysis?.legal_metrology_2011_compliance || {};
  const declarations = analysis?.declarations || {};
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
    <div className="w-full text-ink-900 py-5 sm:py-7 space-y-6 bg-[#f8faf9] font-sans">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-accent-700 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to inspections
        </button>
      )}

      {/* Header & Pure White Summary Metrics */}
      <div className="bg-white border border-ink-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5 text-accent-700" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700 mb-1">
                  Inspection Analysis Report
                </p>
                <h2 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-ink-900">
                  {productName || 'Product Inspection'}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-50 border border-ink-200">
                <PackageCheck className="w-3.5 h-3.5" />
                {category || 'General'}
              </span>
              <span className="text-ink-300">•</span>
              <span>Scanned {new Date(createdAt).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border ${
              status === 'NON_COMPLIANT'
                ? 'bg-red-50 text-red-700 border-red-200'
                : status === 'COMPLIANT'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {status === 'NON_COMPLIANT'
                ? <ShieldAlert className="w-3.5 h-3.5" />
                : status === 'COMPLIANT'
                ? <ShieldCheck className="w-3.5 h-3.5" />
                : <CircleAlert className="w-3.5 h-3.5" />}
              {String(status || '').replaceAll('_', ' ')}
            </span>
            {/* <span className={`text-xs uppercase font-bold px-3 py-1 ${isCompliant
                ? 'text-green-600'
                : 'text-red-600'
              }`}>
              {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
            </span> */}

            {status === 'NON_COMPLIANT' && (
              <button
                onClick={() => navigate(`/complaints/new/${inspection._id}`)}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/15 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Report This Product
              </button>
            )}

          </div>
        </div>

        {/* Clean Pure White Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-4 bg-ink-50/50 border border-ink-200 rounded-xl">
            <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-[0.12em]">Total Rules</p>
            <p className="text-2xl font-display font-semibold text-ink-900 mt-1">7</p>
          </div>
          <div className="p-4 bg-ink-50/50 border border-ink-200 rounded-xl">
            <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-[0.12em]">Present</p>
            <p className="text-2xl font-display font-semibold text-green-700 mt-1">{presentCount}</p>
          </div>
          <div className="p-4 bg-ink-50/50 border border-ink-200 rounded-xl">
            <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-[0.12em]">Missing</p>
            <p className="text-2xl font-display font-semibold text-red-700 mt-1">{missingCount}</p>
          </div>
          <div className="p-4 bg-ink-50/50 border border-ink-200 rounded-xl">
            <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-[0.12em]">AI Confidence</p>
            <p className="text-2xl font-display font-semibold text-ink-900 mt-1">
              {compliance?.confidence_score !== undefined ? `${Math.round(compliance.confidence_score * 100)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Underline Tab Bar with Accent Color */}
      <div className="flex flex-wrap gap-1 bg-white border border-ink-200 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('image')}
          className={`py-2.5 px-3 text-sm font-semibold cursor-pointer transition-all rounded-lg ${activeTab === 'image'
              ? 'bg-accent-50 text-accent-700'
              : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
            }`}
        >
          Annotated Scan & Context View
        </button>
        <button
          onClick={() => setActiveTab('declarations')}
          className={`py-2.5 px-3 text-sm font-semibold cursor-pointer transition-all rounded-lg ${activeTab === 'declarations'
              ? 'bg-accent-50 text-accent-700'
              : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
            }`}
        >
          Declarations Verification ({presentCount}/7)
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`py-3 px-4 text-sm font-bold cursor-pointer transition-all ${activeTab === 'json'
              ? 'bg-accent-50 text-accent-700'
              : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
            }`}
        >
          Raw JSON Payload
        </button>
      </div>

      {/* Tab Area Container — Pure White Background */}
      <div className="bg-transparent min-h-[450px]">

        {/* TAB 1: Side-by-Side Annotated OCR Image & Product Context */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Main Image View (Slides smoothly to Left & Stays) + Stacked Avatar PFP Row */}
            <div className="lg:col-span-7 space-y-4 animate-slide-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-ink-200 pb-3">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-ink-900"><ImageIcon className="w-4 h-4 text-accent-600" />Annotated OCR View</h3>
                  <p className="text-xs text-ink-500 mt-1">Review detected text and bounding boxes</p>
                </div>
                {hasAnnotated && (
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent-600 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-accent-700 shadow-sm transition-colors"
                  >
                    {showOriginal ? <><ShieldCheck className="w-3.5 h-3.5" /> Show Bounding Boxes</> : <><ImageIcon className="w-3.5 h-3.5" /> Show Original Image</>}
                  </button>
                )}
              </div>

              {/* Main Image View Canvas — Clickable PFP style on Pure White */}
              <div
                onClick={() => imageSrc && setLightboxOpen(true)}
                className="bg-ink-50 border border-ink-200 flex items-center justify-center p-3 sm:p-4 min-h-[380px] w-full relative overflow-hidden transition-all duration-300 rounded-2xl cursor-zoom-in group hover:border-accent-400 shadow-sm"
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
                      <span className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 bg-ink-900/90 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg transition-all">
                        <Maximize2 className="w-3.5 h-3.5" /> Click to expand
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No image available</p>
                )}
              </div>

              {/* Package image selector */}
              {images.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                        Package image views
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        Select a view to inspect
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 bg-white border border-ink-200 px-2.5 py-1.5 rounded-full">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {images.length} {images.length === 1 ? 'image' : 'images'}
                    </span>
                  </div>

                  <div className="bg-white border border-ink-200 rounded-2xl p-3 shadow-sm">
                    <div className="flex flex-wrap gap-2.5">
                      {images.map((img, idx) => {
                        const isSelected = selectedImageIndex === idx;
                        const imgSrcThumb = img.annotatedImage || img.url;
                        const viewLabel = img.view || `IMAGE ${idx + 1}`;

                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`group relative flex items-center gap-2.5 rounded-xl border p-1.5 pr-3 text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-accent-600 bg-accent-50 ring-1 ring-accent-600 shadow-sm'
                                : 'border-ink-200 bg-white hover:border-accent-300 hover:bg-ink-50'
                            }`}
                            title={`View ${viewLabel}`}
                            aria-label={`Select ${viewLabel}`}
                          >
                            <div className={`relative w-16 h-14 sm:w-20 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-ink-100 ${
                              isSelected ? 'ring-1 ring-accent-200' : ''
                            }`}>
                              <img
                                src={imgSrcThumb}
                                alt={viewLabel}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-accent-600 text-white'
                                  : 'bg-ink-900/75 text-white'
                              }`}>
                                {idx + 1}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className={`text-xs font-bold uppercase tracking-wide truncate ${
                                isSelected ? 'text-accent-700' : 'text-ink-700'
                              }`}>
                                {viewLabel}
                              </p>
                              <p className="text-[10px] text-ink-400 mt-0.5">
                                {isSelected ? 'Currently viewing' : 'View image'}
                              </p>
                            </div>

                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-accent-600 ml-1 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                      <span className="text-xs text-ink-500">
                        Active view:
                      </span>
                      <span className="text-xs font-semibold text-ink-900">
                        {currentImage?.view || `Image ${selectedImageIndex + 1}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Product Context & Audit Summary (Pure White Cards with AI Typewriter Response) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-ink-900"><FileCheck2 className="w-4 h-4 text-accent-600" />Product Inspection Context</h3>
                <p className="text-xs text-gray-500 mt-0.5">Context and overall metrology audit summary</p>
              </div>

              {/* Prominent Text Size for Product Overview & Label Context */}
              <div className="bg-white border border-ink-200 p-5 rounded-xl space-y-3 shadow-sm">
                <h4 className="font-semibold text-xs text-ink-700 uppercase tracking-[0.1em] border-b border-ink-200 pb-2 flex items-center justify-between">
                  <span>Product Overview & Label Context:</span>
                </h4>
                <p className="text-sm text-ink-700 leading-7 pt-1">
                  <AiTypewriterText text={context} speed={10} />
                </p>
              </div>

              {/* Prominent Text Size for Compliance Audit Summary */}
              <div className="bg-white border border-ink-200 p-5 rounded-xl space-y-3 shadow-sm">
                <h4 className="font-semibold text-xs text-ink-700 uppercase tracking-[0.1em] border-b border-ink-200 pb-2 flex items-center justify-between">
                  <span>Compliance Audit Overview:</span>
                </h4>
                <p className="text-sm text-ink-700 leading-7 pt-1">
                  <AiTypewriterText text={summary} speed={10} />
                </p>
              </div>

              {/* Quick Status Breakdown Card */}
              <div className="p-4 space-y-3 text-sm bg-white border border-ink-200 rounded-xl shadow-sm">
                <div className="flex justify-between border-b border-ink-100 pb-2.5">
                  <span>Mandatory Rules Compliant:</span>
                  <span className="font-bold text-green-700">{presentCount} / 7</span>
                </div>
                <div className="flex justify-between border-b border-ink-100 pb-2.5">
                  <span>Mandatory Rules Missing:</span>
                  <span className="font-bold text-red-600">{missingCount} / 7</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Overall Status:</span>
                  <span className={`font-bold uppercase ${isCompliant ? 'text-green-700' : 'text-red-600'
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-ink-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-black">Mandatory Declarations Verification</h3>
                <p className="text-sm text-gray-500 mt-0.5">Legal Metrology (Packaged Commodities) Rules, 2011 Compliance Audit</p>
              </div>
              <span className="text-sm font-bold text-accent-700 bg-accent-50 border border-accent-200 px-3 py-1 rounded">
                {presentCount} / 7 Rules Compliant
              </span>
            </div>

            {/* Classic Table */}
            <div className="overflow-x-auto border border-ink-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse font-sans text-sm">
                <thead>
                  <tr className="bg-ink-50 border-b border-ink-200 text-ink-700 font-bold uppercase tracking-wider text-xs">
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
                      <tr key={dec.key} className="hover:bg-accent-50/30 transition-colors">

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
                          <span className={`inline-block text-xs font-bold px-3 py-1 uppercase rounded ${isPresent
                              ? 'text-green-700'
                              : 'text-red-700'
                            }`}>
                            {isPresent ? <><CheckCircle2 className="w-3.5 h-3.5" /> Present</> : <><CircleAlert className="w-3.5 h-3.5" /> Missing</>}
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
            <pre className="text-xs font-mono text-slate-100 bg-[#0f172a] text-slate-100 border border-ink-200 p-5 rounded-xl overflow-x-auto max-h-[600px] shadow-sm leading-relaxed">
              <code>{JSON.stringify(analysis, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox / PFP Style Modal Viewer */}
      {lightboxOpen && imageSrc && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-ink-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 inline-flex items-center gap-1.5 text-white font-semibold text-xs bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2 rounded-lg cursor-pointer backdrop-blur"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <img
              src={imageSrc}
              alt={currentImage?.view || 'Full view'}
              className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="inline-flex items-center gap-1.5 text-white text-xs font-semibold mt-3 text-center bg-ink-900/90 border border-white/10 px-4 py-2 rounded-lg shadow-lg">
              {currentImage?.view || `Image ${selectedImageIndex + 1}`} ({showOriginal ? 'Original Image' : 'Annotated Bounding Boxes'})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionResultViewer;
