import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';

const CallToAction = () => {
  return (
    <section id="about" className="py-16 px-6">
      <div className="max-w-7xl mx-auto bg-green-50 border border-green-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="flex items-center gap-4">
          <Leaf size={48} className="text-green-700" />

          <div>
            <h2 className="text-2xl font-bold">
              Build a more transparent marketplace.
            </h2>

            <p className="text-gray-600 mt-2">
              Start inspecting packaged commodities with INNOVATRIX.
            </p>
          </div>
        </div>

        <Link
          to="/register"
          className="shrink-0 bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          Get Started <ArrowRight size={18} />
        </Link>

      </div>
    </section>
  );
};

export default CallToAction;