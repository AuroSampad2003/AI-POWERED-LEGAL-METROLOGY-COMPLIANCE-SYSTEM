import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import ImageDropzone from '../components/ImageDropzone';
import ImageThumbnail from '../components/ImageThumbnail';
import Field, { inputClasses } from '../components/ui/Field';
import Button from '../components/ui/Button';

const MAX_FILES = 6;
let idCounter = 0;

const NewInspection = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({ productName: '', category: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      navigate('/dashboard', {
        state: { justSubmittedId: res.data.inspection?._id },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-4 transition-colors duration-150"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.24a.75.75 0 010-1.06l4.25-4.24a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          Back to dashboard
        </button>

        <h2 className="font-display text-2xl font-semibold text-ink-900">New product inspection</h2>
        <p className="text-sm text-ink-500 mt-1.5 mb-6">
          Upload clear images of the package. Analysis will begin once submitted.
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
              {submitting ? 'Uploading' : 'Submit for analysis'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewInspection;
