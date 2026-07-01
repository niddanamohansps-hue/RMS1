import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Phone, Lock, X, User, Mail } from "lucide-react";
import { api } from "../../../lib/api";
import logoImg from "../../../assets/logo.png";
import campusImg from "../../../assets/campus.jpg";
import "./css/LoginModal.css";
import { MAROON } from "../../../lib/constants";

const capitalizeWords = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

export function LoginModal({ onClose, initialTab = "login", onLoginSuccess, onSignupSuccess }) {
  const [tab, setTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [signup, setSignup] = useState({ name: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);

  useEffect(() => {
    let interval = null;
    if (tab === "forgot" && forgotStep === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [tab, forgotStep, otpTimer]);

  useEffect(() => {
    setLoginError(""); setSignupError(""); setForgotError("");
  }, [tab]);

  const startOtpTimer = () => { setOtpTimer(30); setCanResendOtp(false); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login.identifier || !login.password) { setLoginError("Please fill in all fields."); return; }
    const isEmail = login.identifier.includes("@");
    if (!isEmail) {
      setLoginError("Login requires your registered email address.");
      return;
    }
    
    try {
      const data = await api.post("/auth/login/", {
        email: login.identifier.trim(),
        password: login.password,
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const profile = await api.get("/auth/me/");
      
      setLoginError("");
      onLoginSuccess?.(profile.full_name || profile.first_name || profile.email);
      onClose();
    } catch (err) {
      setLoginError(err.message || "Invalid email or password.");
    }
  };

  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleProceedAfterSignup = () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setSignupSuccess(false);
    if (onSignupSuccess) {
      onSignupSuccess({ name: signup.name, lastName: signup.lastName, email: signup.email, phone: signup.phone });
      onClose();
    } else {
      setTab("login");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signup.name || !signup.email || !signup.phone || !signup.password || !signup.confirm) { setSignupError("Please fill in all required fields."); return; }
    if (!/^[a-zA-Z\s]+$/.test(signup.name.trim())) { setSignupError("First name must contain alphabets only."); return; }
    if (signup.lastName && !/^[a-zA-Z\s]*$/.test(signup.lastName.trim())) { setSignupError("Last name must contain alphabets only."); return; }
    if (signup.phone.length !== 10) { setSignupError("Phone number must be exactly 10 digits."); return; }
    if (signup.password.length < 8) { setSignupError("Password must be at least 8 characters long."); return; }
    if (signup.password !== signup.confirm) { setSignupError("Passwords do not match."); return; }
    
    try {
      const data = await api.post("/auth/register/", {
        email: signup.email.trim(),
        password: signup.password,
        confirm_password: signup.confirm,
        first_name: signup.name.trim(),
        last_name: signup.lastName.trim(),
        phone: signup.phone.trim(),
      });

      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);

      setSignupError("");
      setSignupSuccess(true);
      redirectTimeoutRef.current = setTimeout(handleProceedAfterSignup, 5000);
    } catch (err) {
      setSignupError(err.message || "Registration failed. Email might already exist.");
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) { setForgotError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotIdentifier)) { setForgotError("Please enter a valid email address."); return; }
    setForgotError(""); setForgotStep(2); startOtpTimer();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length !== 6) { setForgotError("Please enter a valid 6-digit OTP."); return; }
    setForgotError(""); setForgotStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 8) { setForgotError("Password must be at least 8 characters long."); return; }
    if (forgotNewPassword !== forgotConfirmPassword) { setForgotError("Passwords do not match."); return; }
    setForgotError(""); setForgotStep(4);
    setTimeout(() => { setTab("login"); setForgotStep(1); setForgotIdentifier(""); setForgotOtp(""); setForgotNewPassword(""); setForgotConfirmPassword(""); }, 2000);
  };

  const handleResendOtp = () => { setForgotOtp(""); setForgotError(""); startOtpTimer(); };

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

            {/* ── Login tab ────────────────────────────────────────────── */}
            {tab === "login" ? (
              <>
                <div className="lm-section-heading">
                  <div className="lm-section-title">Welcome Back!</div>
                  <div className="lm-section-sub">Login to access your account</div>
                </div>

                <form onSubmit={handleLogin} className="lm-form">
                  <div className="lm-input-wrap">
                    <User size={15} className="lm-input-icon" />
                    <input
                      type="text"
                      placeholder="Number / Email"
                      value={login.identifier}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLogin({ ...login, identifier: /^\d+$/.test(val) ? val.slice(0, 10) : val });
                      }}
                      className="lm-input"
                    />
                  </div>

                  <div className="lm-input-wrap">
                    <Lock size={15} className="lm-input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={login.password}
                      onChange={(e) => setLogin({ ...login, password: e.target.value })}
                      className="lm-input lm-input--pad-right"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="lm-eye-btn">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="lm-remember-row">
                    <label className="lm-remember-label">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: MAROON }} />
                      Remember Me
                    </label>
                    <a href="#" className="lm-forgot-link"
                      onClick={(e) => { e.preventDefault(); setTab("forgot"); setForgotStep(1); setForgotIdentifier(""); setForgotOtp(""); setForgotNewPassword(""); setForgotConfirmPassword(""); setForgotError(""); }}>
                      Forgot Password?
                    </a>
                  </div>

                  {loginError && <div className="lm-error">{loginError}</div>}

                  <button type="submit" className="lm-btn-primary">
                    <Lock size={14} /> LOGIN
                  </button>
                </form>

                <div className="lm-switch-hint">Don't have an account?</div>
                <button onClick={() => setTab("signup")} className="lm-btn-outline">
                  <User size={14} /> SIGN UP
                </button>
              </>

            ) : tab === "signup" ? (

              /* ── Signup tab ──────────────────────────────────────────── */
              signupSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="lm-signup-success"
                >
                  <img src={logoImg} alt="South Point School Guwahati" className="lm-signup-success-logo" />
                  <h3 className="lm-signup-success-title">Account Created Successfully!</h3>
                  <div className="lm-signup-success-divider"></div>
                  <p className="lm-signup-success-msg">
                    Welcome to <strong>South Point School, Guwahati</strong>. 
                    Your candidate portal account has been successfully created.
                  </p>
                  <div className="lm-signup-success-next-steps">
                    <h4>What's Next?</h4>
                    <ul>
                      <li>Log in with your credentials to access the candidate dashboard.</li>
                      <li>Complete your profile setup and upload your CV/Resume.</li>
                      <li>Apply directly for any open vacancies or submit a general application.</li>
                    </ul>
                  </div>
                  <div className="lm-signup-success-loader-wrap">
                    <span className="lm-signup-success-spinner"></span>
                    <span className="lm-signup-success-redirect-msg">Redirecting to login in a few seconds…</span>
                  </div>
                  <button type="button" onClick={handleProceedAfterSignup} className="lm-signup-success-close">
                    Proceed to Login
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="lm-section-heading">
                    <div className="lm-section-title">Create Account</div>
                    <div className="lm-section-sub">Join South Point School's portal</div>
                  </div>

                  <form onSubmit={handleSignup} className="lm-form">
                    <div className="lm-name-grid">
                      <div className="lm-input-wrap">
                        <User size={15} className="lm-input-icon" />
                        <input type="text" placeholder="First Name *" required value={signup.name}
                          onChange={(e) => setSignup({ ...signup, name: capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, "")) })}
                          className="lm-input" />
                      </div>
                      <div className="lm-input-wrap">
                        <User size={15} className="lm-input-icon" />
                        <input type="text" placeholder="Last Name" value={signup.lastName}
                          onChange={(e) => setSignup({ ...signup, lastName: capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, "")) })}
                          className="lm-input" />
                      </div>
                    </div>

                    <div className="lm-input-wrap">
                      <Mail size={15} className="lm-input-icon" />
                      <input type="email" placeholder="Email Address *" required value={signup.email}
                        onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                        className="lm-input" />
                    </div>

                    <div className="lm-input-wrap">
                      <Phone size={15} className="lm-input-icon" />
                      <input type="tel" placeholder="Phone Number *" inputMode="numeric" maxLength={10} required
                        value={signup.phone}
                        onChange={(e) => setSignup({ ...signup, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        className="lm-input" />
                      <span className={`lm-phone-count ${signup.phone.length === 10 ? "lm-phone-count--ok" : "lm-phone-count--pending"}`}>
                        {signup.phone.length}/10
                      </span>
                    </div>

                    <div className="lm-input-wrap">
                      <Lock size={15} className="lm-input-icon" />
                      <input type={showPassword ? "text" : "password"} placeholder="Password" value={signup.password}
                        onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                        className="lm-input lm-input--pad-right" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="lm-eye-btn">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <div className="lm-input-wrap">
                      <Lock size={15} className="lm-input-icon" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={signup.confirm}
                        onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
                        className="lm-input lm-input--pad-right"
                        style={{ borderColor: signup.confirm && signup.password !== signup.confirm ? "#d00" : undefined }}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="lm-eye-btn">
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {signup.confirm && signup.password !== signup.confirm && (
                      <div className="lm-error--sm">Passwords do not match</div>
                    )}
                    {signupError && <div className="lm-error">{signupError}</div>}

                    <button type="submit" className="lm-btn-primary hover:opacity-90">CREATE ACCOUNT</button>
                  </form>

                  <button onClick={() => setTab("login")} className="lm-btn-outline--sm">
                    Already have an account? Login
                  </button>
                </>
              )

            ) : (

              /* ── Forgot Password flow ─────────────────────────────────── */
              <>
                <div className="lm-section-heading">
                  <div className="lm-section-title">Reset Password</div>
                  <div className="lm-section-sub">
                    {forgotStep === 1 && "Enter your email address to receive an OTP"}
                    {forgotStep === 2 && `Enter the OTP sent to ${forgotIdentifier}`}
                    {forgotStep === 3 && "Set your new password"}
                    {forgotStep === 4 && "Password reset successful!"}
                  </div>
                </div>

                {forgotError && <div className="lm-error" style={{ marginBottom: 12 }}>{forgotError}</div>}

                {/* Step 1 — Email */}
                {forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} className="lm-form--gap14">
                    <div className="lm-input-wrap">
                      <Mail size={15} className="lm-input-icon" />
                      <input type="email" placeholder="Email Address" value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="lm-input" required />
                    </div>
                    <button type="submit" className="lm-btn-primary hover:opacity-90">SEND OTP</button>
                    <button type="button" onClick={() => setTab("login")} className="lm-btn-text">Back to Login</button>
                  </form>
                )}

                {/* Step 2 — OTP */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="lm-form--gap14">
                    <div className="lm-otp-banner">Demo Mode: You can type any 6-digit OTP to verify.</div>
                    <div className="lm-input-wrap">
                      <Lock size={15} className="lm-input-icon" />
                      <input type="text" placeholder="Enter 6-digit OTP" value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="lm-input" style={{ letterSpacing: "0.15em" }} required />
                    </div>
                    <div className="lm-otp-row">
                      <span className="lm-otp-timer">{!canResendOtp ? `Resend OTP in ${otpTimer}s` : "Didn't receive OTP?"}</span>
                      {canResendOtp && (
                        <button type="button" onClick={handleResendOtp} className="lm-otp-resend-btn">Resend OTP</button>
                      )}
                    </div>
                    <button type="submit" className="lm-btn-primary hover:opacity-90">VERIFY OTP</button>
                    <button type="button" onClick={() => setForgotStep(1)} className="lm-btn-text--muted">Change Email Address</button>
                  </form>
                )}

                {/* Step 3 — New password */}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="lm-form--gap14">
                    <div className="lm-input-wrap">
                      <Lock size={15} className="lm-input-icon" />
                      <input type={showForgotNewPassword ? "text" : "password"} placeholder="New Password *" value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="lm-input lm-input--pad-right" required />
                      <button type="button" onClick={() => setShowForgotNewPassword(!showForgotNewPassword)} className="lm-eye-btn">
                        {showForgotNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="lm-input-wrap">
                      <Lock size={15} className="lm-input-icon" />
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password *"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="lm-input lm-input--pad-right"
                        style={{ borderColor: forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword ? "#d00" : undefined }}
                        required
                      />
                      <button type="button" onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)} className="lm-eye-btn">
                        {showForgotConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword && (
                      <div className="lm-error--sm" style={{ marginTop: -4 }}>Passwords do not match</div>
                    )}
                    <button type="submit" className="lm-btn-primary hover:opacity-90">RESET PASSWORD</button>
                  </form>
                )}

                {/* Step 4 — Success */}
                {forgotStep === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lm-reset-success">
                    <div className="lm-reset-success-icon">✓</div>
                    <div className="lm-reset-success-title">Password Reset Successful!</div>
                    <div className="lm-reset-success-msg">Redirecting you to login…</div>
                  </motion.div>
                )}
              </>
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
