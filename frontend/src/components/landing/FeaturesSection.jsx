import {
  Camera,
  FileSearch,
  ShieldCheck,
  ChartColumn,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'AI-Powered Scanning',
    description:
      'Upload product images and detect important label regions.',
  },
  {
    icon: FileSearch,
    title: 'Intelligent OCR',
    description:
      'Extract manufacturer details, MRP, net quantity, and more.',
  },
  {
    icon: ShieldCheck,
    title: 'Legal Metrology Validation',
    description:
      'Check extracted declarations against applicable rules.',
  },
  {
    icon: ChartColumn,
    title: 'Detailed Reports',
    description:
      'View compliance results, missing declarations, and evidence.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-white/55 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="reveal-up mb-12 text-center">
          <p className="section-kicker mb-3">Built for confidence</p>
          <h2 className="text-3xl md:text-4xl font-black text-ink-900">
            Key Features
          </h2>
          <p className="mt-3 text-base text-ink-600 md:text-lg">
            A complete compliance solution for consumers, inspectors, and regulators.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className={`card-hover reveal-up stagger-${Math.min(index + 1, 4)} rounded-2xl border border-ink-100 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(16,26,46,0.2)]`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 shadow-inner shadow-accent-100">
                  <Icon size={28} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-ink-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;