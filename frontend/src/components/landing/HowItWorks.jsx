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
      className="bg-gray-50 py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">
            How It Works
          </h2>
          <p className="text-gray-500 mt-3">
            From product image to compliance report.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-700 text-white flex items-center justify-center">
                  <Icon size={28} />
                </div>

                <p className="text-green-700 font-semibold mt-4">
                  Step {index + 1}
                </p>

                <h3 className="font-semibold text-lg mt-2">
                  {step.title}
                </h3>

                <p className="text-gray-500 mt-2">
                  {step.description}
                </p>

                {index !== steps.length - 1 && (
                  <ArrowRight
                    className="hidden lg:block text-green-600"
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