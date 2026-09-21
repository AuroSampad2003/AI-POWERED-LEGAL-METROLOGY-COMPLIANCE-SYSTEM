
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import StatsSection from '../components/landing/StatsSection';
import CallToAction from '../components/landing/CallToAction';
import LandingFooter from '../components/landing/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfefc] text-slate-900">
      {/* Navigation */}
      <LandingNavbar />

      <main>
        {/* Hero / Main introduction */}
        <HeroSection />

        {/* Platform features */}
        <FeaturesSection />

        {/* How the system works */}
        <HowItWorks />

        {/* Platform statistics */}
        <StatsSection />

        {/* Final call to action */}
        <CallToAction />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;