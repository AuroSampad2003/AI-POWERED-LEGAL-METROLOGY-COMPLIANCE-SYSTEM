import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Field, { inputClasses } from '../components/ui/Field';

const DECLARATION_META = [
    { key: 'manufacturer_details', title: 'Manufacturer / Packer Details', rule: 'Rule 6(1)(a)' },
    { key: 'country_of_origin', title: 'Country of Origin', rule: 'Rule 6(1)(aa)' },
    { key: 'net_quantity', title: 'Net Quantity', rule: 'Rule 6(1)(c)' },
    { key: 'mrp', title: 'Maximum Retail Price (MRP)', rule: 'Rule 6(1)(e)' },
    { key: 'date_of_manufacture_or_pack', title: 'Date of Mfg / Packing', rule: 'Rule 6(1)(d)' },
    { key: 'consumer_care_details', title: 'Consumer Care Details', rule: 'Rule 6(1)(f)' },
    { key: 'unit_sale_price', title: 'Unit Sale Price (USP)', rule: 'Rule 6(1)(g)' },
];

const ComplaintSubmit = () => {
    const { inspectionId } = useParams();
    const navigate = useNavigate();

    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const fetchInspection = async () => {
            try {
                const res = await axiosInstance.get(`/inspections/${inspectionId}`);
                setInspection(res.data.inspection);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load inspection');
            } finally {
                setLoading(false);
            }
        };
        fetchInspection();
    }, [inspectionId]);

    const declarations = inspection?.analysis?.declarations || {};

   const violations = DECLARATION_META.filter(
    (item) => declarations[item.key]?.missing === 'missing'
);

    const mainImage = inspection?.images?.[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);
        try {
            const res = await axiosInstance.post('/complaints', {
                inspectionId,
                description: description.trim() || undefined,
            });
            // Detail page comes in the next step — for now just confirm and go back.
            navigate('/complaints');
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                    <Loader label="Loading inspection" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !inspection) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                    <div className="px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
                        {error || 'Inspection not found'}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-4 transition-colors duration-150"
                >
                    ← Back
                </button>

                <h2 className="font-display text-2xl font-semibold text-ink-900">Report this product</h2>
                <p className="text-sm text-ink-500 mt-1.5 mb-6">
                    We'll include the product details, images and violations already found by the scan. You only need to add any extra context.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-6">
                        <div className="flex gap-4">
                            {mainImage && (
                                <img
                                    src={mainImage.annotatedImage || mainImage.url}
                                    alt={inspection.productName}
                                    className="w-20 h-20 rounded-lg object-cover border border-ink-200 shrink-0"
                                />
                            )}
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-ink-900 truncate">
                                    {inspection.productName || 'Unnamed product'}
                                </h3>
                                <p className="text-xs text-ink-500 mt-0.5">{inspection.category || 'General'}</p>
                                <p className="text-xs text-ink-400 mt-1">
                                    Scanned {new Date(inspection.createdAt).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-ink-100">
                            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2.5">
                                Violations to be included ({violations.length})
                            </p>
                            {violations.length ? (
                                <ul className="space-y-1.5">
                                    {violations.map((v) => (
                                        <li key={v.key} className="flex items-start gap-2 text-sm text-ink-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-status-fail mt-1.5 shrink-0" />
                                            <span>
                                                {v.title} <span className="text-ink-400">({v.rule})</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-ink-500">No rule violations detected for this scan.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-surface border border-ink-200 rounded-xl p-4 sm:p-6">
                        <Field label="Additional details (optional)" htmlFor="description">
                            <textarea
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={inputClasses(false)}
                                placeholder="Anything else you'd like the reviewing officer to know..."
                            />
                        </Field>
                    </div>

                    {submitError && (
                        <div className="px-3.5 py-2.5 bg-status-fail-bg text-status-fail text-sm rounded-lg border border-status-fail/15">
                            {submitError}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} disabled={submitting} className="sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" variant="accent" size="lg" loading={submitting} className="sm:w-auto">
                            {submitting ? 'Submitting' : 'Submit complaint'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default ComplaintSubmit;