import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import logoImg from "../../../assets/logo.png";
import campusImg from "../../../assets/campus.jpg";
import "./css/LoginModal.css";
import { LoginForm } from "./login/LoginForm";
import { SignupForm } from "./login/SignupForm";
import { ForgotPasswordForm } from "./login/ForgotPasswordForm";

// Modal shell: renders the backdrop, header, tab bar and footer, and swaps
// between the login / signup / forgot-password forms. Each form owns its own
// state and talks to the backend through ./login/authService.
export function LoginModal({ onClose, initialTab = "login", onLoginSuccess, onSignupSuccess }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="lm-backdrop"
        onClick={onClose}
      >
        {/* Background */}
        <img src={campusImg} alt="" className="lm-bg-image" />
        <div className="lm-bg-overlay" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="lm-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose} className="lm-close-btn"><X size={15} /></button>

          {/* Header */}
          <div className="lm-header">
            <img src={logoImg} alt="South Point School" className="lm-header-logo" />
            <div className="lm-header-school">SOUTH POINT SCHOOL</div>
            <div className="lm-header-city">GUWAHATI</div>
            <div className="lm-header-motto">PURSUIT OF EXCELLENCE</div>
          </div>

          {/* Tab bar */}
          {tab !== "forgot" && (
            <div className="lm-tabs">
              {["login", "signup"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`lm-tab-btn ${tab === t ? "lm-tab-btn--active" : "lm-tab-btn--inactive"}`}
                >
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <div className="lm-content">
            {tab === "login" && (
              <LoginForm
                onLoginSuccess={onLoginSuccess}
                onClose={onClose}
                onSwitchTab={setTab}
                onForgotPassword={() => setTab("forgot")}
              />
            )}

            {tab === "signup" && (
              <SignupForm
                onSignupSuccess={onSignupSuccess}
                onClose={onClose}
                onSwitchTab={setTab}
              />
            )}

            {tab === "forgot" && (
              <ForgotPasswordForm onBackToLogin={() => setTab("login")} />
            )}
          </div>

          {/* Footer info strip */}
          <div className="lm-footer-strip">
            {["Rukmini Gaon, Guwahati", "0381-2345678", "info@southpointguwahati.in"].map((item) => (
              <span key={item} className="lm-footer-item">{item}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
