const stats = [
  { value: 'AI', label: 'Assisted Inspection' },
  { value: 'OCR', label: 'Label Text Extraction' },
  { value: 'Rules', label: 'Compliance Validation' },
  { value: 'Reports', label: 'Evidence-Based Results' },
];

const StatsSection = () => {
  return (
    <section className="bg-green-900 text-white py-14 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <h3 className="text-3xl md:text-4xl font-bold">
              {stat.value}
            </h3>

            <p className="text-green-100 mt-2">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;