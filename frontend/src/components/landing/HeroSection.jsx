import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TRUST_POINTS = ['AI-Powered', 'Rule-Based Validation', 'Evidence Reports'];

const COMPLIANCE_ITEMS = [
  'Manufacturer Details',
  'Net Quantity',
  'MRP (incl. of all taxes)',
  'Date of Packing',
  'Consumer Care Details',
  'Country of Origin',
];

const LABEL_CALLOUTS = [
  { label: 'Net Quantity', value: '200 g', className: 'top-4' },
  { label: 'MRP', value: '₹249.00', className: 'top-1/2 -translate-y-1/2' },
  { label: 'Mfg. Date', value: '12/2024', className: 'bottom-4' },
];

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-accent-50 via-surface to-surface px-6 py-20 md:py-28"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-96 w-96 rounded-full bg-accent-100/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-accent-50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
        {/* Copy column */}
        <div className="hero-in" style={{ animationDelay: '0ms' }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3.5 py-1.5 text-xs font-semibold text-accent-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-600" />
            SIH 2026 · SIH26034
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-ink-900 md:text-6xl">
            Verify product labels.
            <span className="block text-accent-700">Build consumer trust.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600">
            An AI-powered platform that scans packaged commodities, extracts
            label declarations, and checks compliance with the Legal
            Metrology (Packaged Commodities) Rules, 2011.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/inspection/new"
              className="group inline-flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-3.5 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-lg hover:shadow-accent-600/20"
            >
              Start Inspection
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white/70 px-6 py-3.5 font-semibold text-ink-800 backdrop-blur-sm transition-all duration-300 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-600">
            {TRUST_POINTS.map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-accent-600" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Visual column */}
        <div className="hero-in mx-auto w-full max-w-md" style={{ animationDelay: '150ms' }}>
          <div className="relative mx-auto w-72">
            {/* dotted grid backdrop */}
            <div
              className="absolute -inset-10 -z-10 rounded-[2rem] opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(var(--color-accent-100) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent-100) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            <div className="float-slow relative">
              {/* corner brackets */}
              <span className="absolute -top-4 -left-4 h-8 w-8 rounded-tl-md border-t-2 border-l-2 border-ink-800/60" />
              <span className="absolute -right-4 -bottom-4 h-8 w-8 rounded-br-md border-r-2 border-b-2 border-ink-800/60" />

              {/* Pouch illustration */}
              <div className="relative mx-auto h-80 w-56 overflow-hidden rounded-[2rem] bg-gradient-to-b from-accent-600 to-accent-900 shadow-2xl">
                <div className="absolute inset-x-6 top-4 h-2 rounded-full bg-white/15" />
                <div className="absolute inset-x-6 top-16 bottom-10 overflow-hidden rounded-2xl bg-white/10">
                  <div className="flex h-full flex-wrap content-center justify-center gap-2 p-4">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-3.5 w-3.5 rounded-full ${
                          i % 3 === 0
                            ? 'bg-amber-200'
                            : i % 3 === 1
                              ? 'bg-amber-800'
                              : 'bg-orange-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {/* scan line */}
                <div className="scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-accent-100 to-transparent" />
              </div>

              {/* Floating label callouts */}
              {LABEL_CALLOUTS.map((item, i) => (
                <div
                  key={item.label}
                  className={`float-chip absolute -left-16 hidden lg:block ${item.className}`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <div className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs shadow-md">
                    <p className="text-ink-500">{item.label}</p>
                    <p className="font-semibold text-ink-900">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Compliance result card */}
              <div className="absolute -top-6 -right-6 w-60 rounded-2xl border border-ink-100 bg-white/95 p-4 shadow-xl backdrop-blur sm:-right-10 sm:w-64">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                  <ShieldCheck size={16} className="text-accent-600" />
                  Compliance Result
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-xl bg-accent-50 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-accent-700">COMPLIANT</p>
                    <p className="text-xs text-ink-500">
                      Compliance Score{' '}
                      <span className="font-semibold text-ink-800">96%</span>
                    </p>
                  </div>
                </div>

                <ul className="mt-3 space-y-2">
                  {COMPLIANCE_ITEMS.map((item, i) => (
                    <li
                      key={item}
                      className="checklist-item flex items-center gap-2 text-xs text-ink-600"
                      style={{ animationDelay: `${0.4 + i * 0.12}s` }}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-in { animation: heroIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }

        @keyframes floatChip {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .float-chip { animation: floatChip 4.5s ease-in-out infinite; }

        @keyframes scanMove {
          0% { top: 14%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 82%; opacity: 0; }
        }
        .scan-line { animation: scanMove 3.2s ease-in-out infinite; }

        @keyframes checklistIn {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .checklist-item { animation: checklistIn 0.5s ease-out both; }
      `}</style>
    </section>
  );
};

export default HeroSection;