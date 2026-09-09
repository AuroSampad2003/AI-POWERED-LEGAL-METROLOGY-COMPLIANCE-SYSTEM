import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    FileWarning,
    Info,
    MapPin,
    Send,
    ShieldAlert,
} from 'lucide-react';
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                    <Loader label="Loading inspection" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !inspection) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-800">
                                    Unable to load inspection
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                    {error || 'Inspection not found'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-full bg-[#f8faf9]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

                    {/* Back */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-accent-700 transition-colors duration-150 mb-5 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to inspection
                    </button>

                    {/* Page heading */}
                    <div className="mb-7">
                        <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-5.5 h-5.5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-600 mb-1">
                                    Compliance complaint
                                </p>
                                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
                                    Report this product
                                </h2>
                            </div>
                        </div>

                        <p className="text-sm sm:text-[15px] text-ink-500 leading-6 mt-3 max-w-2xl">
                            We’ll include the product details, images, and violations already
                            identified by the inspection. Add any extra context that may help
                            the reviewing officer.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Product summary */}
                        <section className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                                        <ClipboardCheck className="w-4 h-4 text-accent-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-ink-900">
                                            Inspection details
                                        </h3>
                                        <p className="text-[11px] text-ink-400 mt-0.5">
                                            Information attached to this complaint
                                        </p>
                                    </div>
                                </div>

                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-[10px] font-bold uppercase tracking-wide text-red-700">
                                    <AlertTriangle className="w-3 h-3" />
                                    {violations.length} {violations.length === 1 ? 'violation' : 'violations'}
                                </span>
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="flex items-center gap-4">
                                    {mainImage ? (
                                        <div className="relative shrink-0">
                                            <img
                                                src={mainImage.annotatedImage || mainImage.url}
                                                alt={inspection.productName || 'Inspected product'}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-ink-200 shadow-sm"
                                            />
                                            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-ink-200 flex items-center justify-center shadow-sm">
                                                <ClipboardCheck className="w-3 h-3 text-accent-600" />
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-center shrink-0">
                                            <FileWarning className="w-6 h-6 text-ink-400" />
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-ink-900 truncate">
                                            {inspection.productName || 'Unnamed product'}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            <span className="text-xs font-medium text-ink-600 bg-ink-50 border border-ink-100 px-2 py-1 rounded-md">
                                                {inspection.category || 'General'}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                Scanned {new Date(inspection.createdAt).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Violations */}
                                <div className="mt-6 pt-5 border-t border-ink-100">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-xs font-semibold text-ink-800">
                                                Detected compliance violations
                                            </p>
                                            <p className="text-[11px] text-ink-400 mt-0.5">
                                                These findings will be included with your report.
                                            </p>
                                        </div>
                                        <FileWarning className="w-4 h-4 text-red-500 shrink-0" />
                                    </div>

                                    {violations.length ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {violations.map((v, index) => (
                                                <div
                                                    key={v.key}
                                                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-red-50/70 border border-red-100"
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-white border border-red-200 flex items-center justify-center text-[10px] font-bold text-red-600 shrink-0">
                                                        {index + 1}
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-ink-800">
                                                            {v.title}
                                                        </p>
                                                        <p className="text-[11px] text-red-600/80 mt-0.5">
                                                            {v.rule}
                                                        </p>
                                                    </div>

                                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-green-50 border border-green-100">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                            <p className="text-sm text-green-700">
                                                No rule violations were detected for this scan.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Additional details */}
                        <section className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                                    <Info className="w-4 h-4 text-accent-700" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-ink-900">
                                        Additional details
                                    </h3>
                                    <p className="text-[11px] text-ink-400 mt-0.5">
                                        Optional — add anything the reviewing officer should know.
                                    </p>
                                </div>
                            </div>

                            <Field label="Your message (optional)" htmlFor="description">
                                <textarea
                                    id="description"
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`${inputClasses(false)} min-h-[130px] resize-y rounded-xl`}
                                    placeholder="Describe anything else that may be relevant, such as where the product was purchased, what you noticed, or any additional context..."
                                />
                            </Field>

                            <div className="flex items-start gap-2 mt-3 text-[11px] text-ink-400">
                                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <p>Your message will be attached to the inspection report for review.</p>
                            </div>
                        </section>

                        {/* Error */}
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">
                                            Submission failed
                                        </p>
                                        <p className="text-sm text-red-600 mt-0.5">
                                            {submitError}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white border border-ink-200 rounded-2xl p-4 sm:px-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="hidden sm:flex items-center gap-2 text-xs text-ink-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Complaint linked to this inspection
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => navigate(-1)}
                                        disabled={submitting}
                                        className="sm:w-auto"
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="accent"
                                        size="lg"
                                        loading={submitting}
                                        className="sm:w-auto"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            {!submitting && <Send className="w-4 h-4" />}
                                            {submitting ? 'Submitting' : 'Submit complaint'}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ComplaintSubmit;
