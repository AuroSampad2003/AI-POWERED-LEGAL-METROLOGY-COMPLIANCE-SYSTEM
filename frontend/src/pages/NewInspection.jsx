import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileImage, Info, Package, ShieldCheck, UploadCloud } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import ImageDropzone from '../components/ImageDropzone';
import ImageThumbnail from '../components/ImageThumbnail';
import Field, { inputClasses } from '../components/ui/Field';
import Button from '../components/ui/Button';
import InspectionResultViewer from '../components/InspectionResultViewer';
import OptimisticTextLoader from '../components/OptimisticTextLoader';

const MAX_FILES = 6;
let idCounter = 0;

const QuitConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-ink-200 p-6 sm:p-7 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-ink-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink-900">
              Leave this inspection?
            </h3>
            <p className="text-sm text-ink-500 leading-6 mt-1">
              You are currently viewing or generating inspection analysis results. Leaving now will close your current result session.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 rounded-lg cursor-pointer transition-colors"
          >
            Stay on Page
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 text-sm font-semibold bg-status-fail text-white rounded-lg hover:opacity-90 cursor-pointer transition-opacity"
          >
            Yes, Leave Page
          </button>
        </div>
      </div>
    </div>
  );
};

const NewInspection = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({ productName: '', category: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzedInspection, setAnalyzedInspection] = useState(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser window/tab close or refresh event listener
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (submitting || analyzedInspection) {
        e.preventDefault();
        e.returnValue = 'You are currently viewing or generating inspection results. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitting, analyzedInspection]);

  const suggestNextView = (existing) => {
    const used = existing.map((img) => img.view);
    const order = ['FRONT', 'BACK', 'SIDE', 'OTHER'];
    return order.find((v) => !used.includes(v)) || 'OTHER';
  };

  const handleFilesSelected = (files) => {
    setError('');
    setImages((prev) => {
      const additions = files.map((file) => ({
        id: ++idCounter,
        file,
        preview: URL.createObjectURL(file),
        view: suggestNextView(prev),
      }));
      return [...prev, ...additions].slice(0, MAX_FILES);
    });
  };

  const handleRemove = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleViewChange = (id, view) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, view } : img)));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      setError('Add at least one image before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (form.productName) formData.append('productName', form.productName);
      if (form.category) formData.append('category', form.category);
      images.forEach((img) => {
        formData.append('images', img.file);
        formData.append('imageViews', img.view);
      });

      const res = await axiosInstance.post('/inspections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.inspection) {
        setAnalyzedInspection(res.data.inspection);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setForm({ productName: '', category: '' });
    setAnalyzedInspection(null);
    setError('');
  };

  const requestNavigation = (targetPathOrAction) => {
    if (submitting || analyzedInspection) {
      setPendingTarget(() => targetPathOrAction);
      setShowQuitModal(true);
    } else {
      if (typeof targetPathOrAction === 'function') {
        targetPathOrAction();
      } else {
        navigate(targetPathOrAction);
      }
    }
  };

  const confirmQuit = () => {
    setShowQuitModal(false);
    if (pendingTarget) {
      if (typeof pendingTarget === 'function') {
        pendingTarget();
      } else {
        navigate(pendingTarget);
      }
    } else {
      handleResetForm();
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f7f9f8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {!analyzedInspection && (
            <button
              type="button"
              onClick={() => requestNavigation('/dashboard')}
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-accent-700 transition-colors cursor-pointer mb-6"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-white group-hover:border-accent-200 group-hover:bg-accent-50 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
              Back to dashboard
            </button>
          )}

          {submitting ? (
            <OptimisticTextLoader images={images} />
          ) : analyzedInspection ? (
            <div className="space-y-6">
              <InspectionResultViewer
                inspection={analyzedInspection}
                onBack={() => requestNavigation(handleResetForm)}
              />
            </div>
          ) : (
            <>
              {/* Page header */}
              <div className="mb-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent-700 mb-3">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Compliance inspection
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
                      New product inspection
                    </h1>
                    <p className="text-sm sm:text-[15px] leading-6 text-ink-500 mt-2">
                      Upload clear package images and let OCR + AI automatically extract label information
                      and check compliance with the Legal Metrology (Packaged Commodities) Rules, 2011.
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 shrink-0 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                      <FileImage className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Image limit</p>
                      <p className="text-sm font-semibold text-ink-800">Up to {MAX_FILES} images</p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white">
                      1
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-ink-800">Add product details</span>
                  </div>
                  <div className="h-px flex-1 max-w-16 sm:max-w-24 bg-ink-200" />
                  <div className="flex items-center gap-2 text-ink-400">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-white text-xs font-semibold">
                      2
                    </span>
                    <span className="hidden sm:inline text-xs sm:text-sm font-medium">Upload images</span>
                  </div>
                  <div className="h-px flex-1 max-w-16 sm:max-w-24 bg-ink-200" />
                  <div className="flex items-center gap-2 text-ink-400">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-white text-xs font-semibold">
                      3
                    </span>
                    <span className="hidden sm:inline text-xs sm:text-sm font-medium">Analyze</span>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-status-fail/20 bg-status-fail-bg px-4 py-3.5 text-sm text-status-fail shadow-sm"
                >
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Product details */}
                <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
                  <div className="border-b border-ink-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                        <Package className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm sm:text-[15px] font-semibold text-ink-900">
                            Product details
                          </h2>
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                            Optional
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-ink-500 mt-1">
                          Add details to make your inspection easier to identify later.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Product name" htmlFor="productName">
                        <input
                          id="productName"
                          name="productName"
                          type="text"
                          value={form.productName}
                          onChange={handleChange}
                          className={`${inputClasses(false)} h-11 bg-ink-50/30 focus:bg-white`}
                          placeholder="e.g. ABC Biscuits 500g"
                        />
                      </Field>

                      <Field label="Category" htmlFor="category">
                        <input
                          id="category"
                          name="category"
                          type="text"
                          value={form.category}
                          onChange={handleChange}
                          className={`${inputClasses(false)} h-11 bg-ink-50/30 focus:bg-white`}
                          placeholder="e.g. Packaged food"
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Images */}
                <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
                  <div className="border-b border-ink-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                          <UploadCloud className="w-[18px] h-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm sm:text-[15px] font-semibold text-ink-900">
                              Package images
                            </h2>
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                              Recommended
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-ink-500 mt-1">
                            Upload front, back and side views for a more complete compliance check.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1.5">
                        <span className="text-xs font-semibold tabular-nums text-ink-600">
                          {images.length}
                          <span className="text-ink-400">/{MAX_FILES}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <ImageDropzone
                      onFilesSelected={handleFilesSelected}
                      disabled={submitting}
                      maxFiles={MAX_FILES}
                      currentCount={images.length}
                    />

                    {images.length > 0 && (
                      <div className="mt-5">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                            Selected images
                          </p>
                          <p className="text-xs text-ink-400">Review the view label before analysis</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {images.map((img) => (
                            <ImageThumbnail
                              key={img.id}
                              image={img}
                              onRemove={handleRemove}
                              onViewChange={handleViewChange}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-ink-100 bg-ink-50/70 px-3.5 py-3">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-ink-400" />
                      <p className="text-xs leading-5 text-ink-500">
                        Use well-lit, sharp images where the product label is fully visible.
                        Avoid glare, blur and cropped text for better OCR accuracy.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
                  <div className="flex items-center gap-2 text-xs text-ink-400">
                    <CheckCircle2 className="w-4 h-4 text-accent-600" />
                    <span>Your images are processed securely for this inspection.</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => requestNavigation('/dashboard')}
                      disabled={submitting}
                      className="w-full sm:w-auto min-w-28"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      loading={submitting}
                      disabled={images.length === 0}
                      className="w-full sm:w-auto min-w-44 shadow-sm"
                    >
                      Submit for analysis
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* Are you sure quit confirmation modal */}
          <QuitConfirmModal
            isOpen={showQuitModal}
            onClose={() => setShowQuitModal(false)}
            onConfirm={confirmQuit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewInspection;
