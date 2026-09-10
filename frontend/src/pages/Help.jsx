import {
  AlertTriangle,
  BookOpenCheck,
  ClipboardCheck,
  FileSearch,
  MessageSquareWarning,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const sections = [
  {
    title: 'How scanning works',
    body: 'Upload or capture clear images of the front, back and side of a package. The system reads the printed declarations and checks them against applicable Legal Metrology requirements.',
    icon: ScanLine,
    label: 'Scanning',
    tone: 'accent',
  },
  {
    title: 'Understanding your result',
    body: 'Each check is marked Pass, Fail or Warning. A Fail means a required declaration was missing or incorrect. A Warning means the result needs manual verification.',
    icon: FileSearch,
    label: 'Analysis',
    tone: 'blue',
  },
  {
    title: 'Filing a complaint',
    body: 'If a scan shows a likely violation, you can submit a complaint with the evidence attached. An admin reviews it and decides on verification, rejection or escalation.',
    icon: MessageSquareWarning,
    label: 'Complaints',
    tone: 'red',
  },
  {
    title: 'Complaint status meanings',
    body: 'Pending Review, Under Review, More Information Required, Verified, Rejected, Escalated — each stage reflects where your complaint is in the admin review process.',
    icon: ShieldCheck,
    label: 'Status',
    tone: 'green',
  },
];

const toneStyles = {
  accent: {
    icon: 'bg-accent-50 border-accent-100 text-accent-700',
    badge: 'bg-accent-50 text-accent-700 border-accent-100',
    line: 'bg-accent-600',
  },
  blue: {
    icon: 'bg-blue-50 border-blue-100 text-blue-700',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    line: 'bg-blue-600',
  },
  red: {
    icon: 'bg-red-50 border-red-100 text-red-700',
    badge: 'bg-red-50 text-red-700 border-red-100',
    line: 'bg-red-600',
  },
  green: {
    icon: 'bg-green-50 border-green-100 text-green-700',
    badge: 'bg-green-50 text-green-700 border-green-100',
    line: 'bg-green-600',
  },
};

const Help = () => (
  <DashboardLayout>
    <div className="min-h-full bg-[#f8faf9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center">
              <BookOpenCheck className="w-5 h-5 text-accent-700" />
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700">
              Support & guidance
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
            Help & guidelines
          </h2>

          <p className="text-sm sm:text-[15px] text-ink-500 mt-1.5 max-w-2xl leading-6">
            A quick guide to scanning products and understanding compliance results.
          </p>
        </div>

        {/* Quick overview */}
        <div className="bg-white border border-ink-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4 h-4 text-accent-700" />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">
                Using the compliance platform
              </p>
              <p className="text-xs text-ink-500 mt-1 leading-5">
                Scan a packaged product, review the detected declarations,
                and report any likely violations when necessary.
              </p>
            </div>
          </div>
        </div>

        {/* Guide sections */}
        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const styles = toneStyles[section.tone];

            return (
              <article
                key={section.title}
                className="group relative bg-white border border-ink-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-ink-300 transition-all duration-200"
              >
                <div className="flex">

                  {/* Accent strip */}
                  <div className={`w-1 shrink-0 ${styles.line}`} />

                  <div className="flex-1 p-5 sm:p-6">

                    {/* Section header */}
                    <div className="flex items-start gap-4">

                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${styles.icon}`}
                      >
                        <Icon className="w-5 h-5" strokeWidth={1.9} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold text-ink-400">
                            0{index + 1}
                          </span>

                          <span className="text-ink-200">•</span>

                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}
                          >
                            {section.label}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-ink-900">
                          {section.title}
                        </h3>

                        <p className="text-sm text-ink-600 leading-6 mt-2.5">
                          {section.body}
                        </p>

                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-6 flex items-start gap-3 bg-amber-50/70 border border-amber-100 rounded-2xl p-4">
          <div className="w-8 h-8 rounded-lg bg-white border border-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-900">
              Important
            </p>
            <p className="text-xs text-amber-800/80 leading-5 mt-0.5">
              Automated compliance results are intended to assist review.
              Always verify important findings against the applicable requirements.
            </p>
          </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
);

export default Help;