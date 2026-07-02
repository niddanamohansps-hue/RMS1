import { useState, useEffect, useRef } from "react";
import { User, Phone, Lock, EyeOff, Eye } from "lucide-react";
import { MAROON } from "../../../../lib/constants";

export function ForgotPasswordForm({ onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  const timerRef = useRef(null);

  const startOtpTimer = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setStep(2);
    startOtpTimer();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(4);
    setTimeout(() => {
      onBackToLogin();
    }, 2000);
  };

  const handleResendOtp = () => {
    setOtp("");
    setError("");
    startOtpTimer();
  };

  return (
    <>
      <div className="lm-section-heading">
        <div className="lm-section-title">Reset Password</div>
        <div className="lm-section-sub">
          {step === 1 && "Enter your registered email / phone to receive an OTP"}
          {step === 2 && "Enter the 6-digit OTP sent to your device"}
          {step === 3 && "Create a new secure password"}
          {step === 4 && "Password updated successfully!"}
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="lm-form">
          <div className="lm-input-wrap">
            <User size={15} className="lm-input-icon" />
            <input
              type="text"
              placeholder="Email / Phone"
              value={identifier}
              onChange={(e) => {
                const val = e.target.value;
                setIdentifier(/^\d+$/.test(val) ? val.slice(0, 10) : val);
              }}
              className="lm-input"
            />
          </div>
          {error && <div className="lm-error">{error}</div>}
          <button type="submit" className="lm-btn-primary">
            SEND OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="lm-form">
          <div className="lm-otp-desc">
            Sending OTP to <strong style={{ color: MAROON }}>{identifier}</strong>
          </div>
          <div className="lm-input-wrap">
            <Phone size={15} className="lm-input-icon" />
            <input
              type="text"
              placeholder="6-Digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="lm-input lm-otp-input"
            />
          </div>
          <div className="lm-timer-row">
            {resendTimer > 0 ? (
              <span>
                Resend OTP in <strong>{resendTimer}s</strong>
              </span>
            ) : (
              <button type="button" onClick={handleResendOtp} className="lm-resend-btn">
                Resend OTP
              </button>
            )}
          </div>
          {error && <div className="lm-error">{error}</div>}
          <button type="submit" className="lm-btn-primary">
            VERIFY OTP
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="lm-form">
          <div className="lm-input-wrap">
            <Lock size={15} className="lm-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="lm-input lm-input--pad-right"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="lm-eye-btn"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="lm-input-wrap">
            <Lock size={15} className="lm-input-icon" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="lm-input lm-input--pad-right"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="lm-eye-btn"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <div className="lm-error">{error}</div>}
          <button type="submit" className="lm-btn-primary">
            UPDATE PASSWORD
          </button>
        </form>
      )}

      {step === 4 && (
        <div style={{ textAlign: "center", padding: "20px 0", color: MAROON, fontWeight: 700 }}>
          Redirecting to Login...
        </div>
      )}

      <button
        onClick={onBackToLogin}
        className="lm-btn-text"
        style={{ marginTop: 10, display: "block", width: "100%", textAlign: "center" }}
      >
        Back to Login
      </button>
    </>
  );
}
