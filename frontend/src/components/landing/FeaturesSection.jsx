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
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Key Features
          </h2>
          <p className="text-gray-500 mt-3">
            A complete compliance solution for consumers and inspectors.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <Icon size={28} />
                </div>

                <h3 className="text-lg font-semibold mt-5">
                  {feature.title}
                </h3>

                <p className="text-gray-500 mt-3 leading-relaxed">
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