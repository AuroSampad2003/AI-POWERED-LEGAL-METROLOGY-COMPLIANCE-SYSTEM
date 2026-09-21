import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';

const CallToAction = () => {
  return (
    <section id="about" className="px-6 py-20">
      <div className="reveal-up mx-auto max-w-7xl rounded-3xl border border-accent-100 bg-linear-to-r from-accent-50 via-white to-emerald-50 p-8 shadow-[0_25px_80px_-40px_rgba(27,99,56,0.45)] md:p-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-lg shadow-accent-600/20">
              <Leaf size={30} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-ink-900 md:text-3xl">
                Build a more transparent marketplace.
              </h2>

              <p className="mt-2 text-base text-ink-600">
                Start inspecting packaged commodities with PackSure AI.
              </p>
            </div>
          </div>

          <Link
            to="/register"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 font-semibold text-white shadow-[0_20px_40px_-18px_rgba(27,99,56,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-700"
          >
            Get Started
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;