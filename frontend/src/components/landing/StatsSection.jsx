const stats = [
  { value: 'AI', label: 'Assisted Inspection' },
  { value: 'OCR', label: 'Label Text Extraction' },
  { value: 'Rules', label: 'Compliance Validation' },
  { value: 'Reports', label: 'Evidence-Based Results' },
];

const StatsSection = () => {
  return (
    <section className="bg-gradient-to-r from-accent-900 via-accent-800 to-accent-700 py-14 px-6 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="reveal-up rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="text-3xl font-black md:text-4xl">
              {stat.value}
            </h3>

            <p className="mt-2 text-sm text-emerald-50/90 md:text-base">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;