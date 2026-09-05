import DashboardLayout from '../components/DashboardLayout';

const sections = [
  {
    title: 'How scanning works',
    body: 'Upload or capture clear images of the front, back and side of a package. The system reads the printed declarations and checks them against applicable Legal Metrology requirements.',
  },
  {
    title: 'Understanding your result',
    body: 'Each check is marked Pass, Fail or Warning. A Fail means a required declaration was missing or incorrect. A Warning means the result needs manual verification.',
  },
  {
    title: 'Filing a complaint',
    body: 'If a scan shows a likely violation, you can submit a complaint with the evidence attached. An admin reviews it and decides on verification, rejection or escalation.',
  },
  {
    title: 'Complaint status meanings',
    body: 'Pending Review, Under Review, More Information Required, Verified, Rejected, Escalated — each stage reflects where your complaint is in the admin review process.',
  },
];

const Help = () => (
  <DashboardLayout>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h2 className="font-display text-2xl font-semibold text-ink-900">Help & guidelines</h2>
      <p className="text-sm text-ink-500 mt-1.5 mb-6">
        A quick guide to scanning products and understanding compliance results.
      </p>

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-surface border border-ink-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-ink-800 mb-1.5">{s.title}</h3>
            <p className="text-sm text-ink-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Help;
