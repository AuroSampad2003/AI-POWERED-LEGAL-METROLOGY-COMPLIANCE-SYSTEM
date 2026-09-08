import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border-2 border-accent-600 p-6 rounded-xl max-w-md w-full shadow-2xl space-y-4 text-black">
        <h3 className="text-xl font-bold text-black border-b border-gray-200 pb-2">
          Are you sure you want to leave?
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          You are currently viewing or generating inspection analysis results. Leaving now will close your current result session.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border border-accent-600 bg-white text-accent-700 hover:bg-accent-50 rounded cursor-pointer"
          >
            Stay on Page
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {!analyzedInspection && (
          <button
            onClick={() => requestNavigation('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black mb-4 transition-colors font-semibold cursor-pointer"
          >
            ← Back to dashboard
          </button>
        )}

        {submitting ? (
          <OptimisticTextLoader images={images} />
        ) : analyzedInspection ? (
          /* Result Tab View — New Scan Area completely removed while viewing results */
          <div className="space-y-6">
            <InspectionResultViewer
              inspection={analyzedInspection}
              onBack={() => requestNavigation(handleResetForm)}
            />
          </div>
        ) : (
          /* New Scan Area Upload Form */
          <>
            <h2 className="font-display text-2xl font-semibold text-ink-900">New product inspection</h2>
            <p className="text-sm text-ink-500 mt-1.5 mb-6">
              Upload clear images of the package. OCR & AI analysis will process bounding boxes and Legal Metrology 2011 compliance automatically.
            </p>

            {error && (
              <div className="mb-5 px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-ink-800 mb-4">Product details (optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product name" htmlFor="productName">
                    <input
                      id="productName"
                      name="productName"
                      type="text"
                      value={form.productName}
                      onChange={handleChange}
                      className={inputClasses(false)}
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
                      className={inputClasses(false)}
                      placeholder="e.g. Packaged food"
                    />
                  </Field>
                </div>
              </div>

              <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-ink-800">Package images</h3>
                  <span className="text-xs text-ink-400">{images.length}/{MAX_FILES}</span>
                </div>

                <ImageDropzone
                  onFilesSelected={handleFilesSelected}
                  disabled={submitting}
                  maxFiles={MAX_FILES}
                  currentCount={images.length}
                />

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {images.map((img) => (
                      <ImageThumbnail key={img.id} image={img} onRemove={handleRemove} onViewChange={handleViewChange} />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  disabled={submitting}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="lg" loading={submitting} className="sm:w-auto">
                  Submit for analysis
                </Button>
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
    </DashboardLayout>
  );
};

export default NewInspection;
