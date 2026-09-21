import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <Link
            to="/"
            className="text-2xl font-bold text-green-700"
          >
            INNOVATRIX
          </Link>

          <p className="text-gray-500 mt-4 leading-relaxed">
            AI-Powered Legal Metrology Compliance System.
          </p>

          <p className="text-sm text-gray-400 mt-3">
            SIH 2026 | SIH26034
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>

          <div className="flex flex-col gap-3 text-gray-500">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-semibold mb-4">Account</h3>

          <div className="flex flex-col gap-3 text-gray-500">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/help">Help & Support</Link>
          </div>
        </div>

        {/* Project */}
        <div>
          <h3 className="font-semibold mb-4">Our Mission</h3>

          <p className="text-gray-500 leading-relaxed">
            Making packaged commodity compliance information
            easier to inspect, understand, and verify.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-3 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} INNOVATRIX. All rights reserved.
          </p>

          <p>Built for SIH 2026</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;