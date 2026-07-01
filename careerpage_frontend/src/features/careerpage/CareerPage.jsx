import { CREAM } from "../../lib/constants";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { OpportunitiesSection } from "./components/OpportunitiesSection";
import { TalentPoolSection } from "./components/TalentPoolSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { FeedbackForm } from "./components/FeedbackForm";
import { Footer } from "./components/Footer";

// Public-facing career page. Presentation only — all auth/apply actions are
// passed in from App, which owns the cross-cutting modal + dashboard state.
export function CareerPage({
  loggedInUser,
  onLogin,
  onSignup,
  onOpenDashboard,
  onLogout,
  onApplyJob,
  appliedJobIds,
}) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: CREAM,
        color: "#1a0a0a",
      }}
      className="min-h-screen"
    >
      <Navbar
        loggedInUser={loggedInUser}
        onLogin={onLogin}
        onSignup={onSignup}
        onOpenDashboard={onOpenDashboard}
        onLogout={onLogout}
      />
      <HeroSection loggedInUser={loggedInUser} />
      <OpportunitiesSection onApplyJob={onApplyJob} appliedJobIds={appliedJobIds} />
      {!loggedInUser && <TalentPoolSection onSubmitProfile={onSignup} />}
      <BenefitsSection />
      <FeedbackForm />
      <Footer />
    </div>
  );
}
