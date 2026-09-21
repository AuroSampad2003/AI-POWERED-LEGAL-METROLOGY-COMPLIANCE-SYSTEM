import {
  Camera,
  FileText,
  ShieldCheck,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: 'Upload Product Images',
    description: 'Capture or upload clear package images.',
  },
  {
    icon: FileText,
    title: 'Extract Declarations',
    description: 'AI and OCR extract label information.',
  },
  {
    icon: ShieldCheck,
    title: 'Validate with Rules',
    description: 'Check declarations against applicable requirements.',
  },
  {
    icon: ClipboardCheck,
    title: 'Get Compliance Report',
    description: 'Review results, violations, and evidence.',
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-surface to-emerald-50/60 py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="reveal-up mb-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-ink-900">
            How It Works
          </h2>
          <p className="mt-3 text-base text-ink-600 md:text-lg">
            From product image to compliance report in four simple steps.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="reveal-up card-hover relative rounded-3xl border border-ink-100 bg-white p-6 text-center shadow-[0_18px_40px_-30px_rgba(16,26,46,0.25)]"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-lg shadow-accent-600/20">
                  <Icon size={28} />
                </div>

                <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-accent-700">
                  Step {index + 1}
                </p>

                <h3 className="mt-2 text-xl font-bold text-ink-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {step.description}
                </p>

                {index !== steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-accent-300 lg:block"
                    size={24}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;