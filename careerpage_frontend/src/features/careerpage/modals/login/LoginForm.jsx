import { useState } from "react";
import { User, Lock, EyeOff, Eye } from "lucide-react";
import { authService } from "./authService";
import { MAROON } from "../../../../lib/constants";

export function LoginForm({ onLoginSuccess, onClose, onSwitchTab, onForgotPassword }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const isEmail = identifier.includes("@");
    if (!isEmail) {
      setError("Login requires your registered email address.");
      return;
    }

    try {
      const profile = await authService.login(identifier, password);
      setError("");
      if (onLoginSuccess) {
        onLoginSuccess(profile.full_name || profile.first_name || profile.email);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    }
  };

  return (
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
            value={identifier}
            onChange={(e) => {
              const val = e.target.value;
              setIdentifier(/^\d+$/.test(val) ? val.slice(0, 10) : val);
            }}
            className="lm-input"
          />
        </div>

        <div className="lm-input-wrap">
          <Lock size={15} className="lm-input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="lm-input lm-input--pad-right"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="lm-eye-btn">
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <div className="lm-remember-row">
          <label className="lm-remember-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: MAROON }}
            />
            Remember Me
          </label>
          <a
            href="#"
            className="lm-forgot-link"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
          >
            Forgot Password?
          </a>
        </div>

        {error && <div className="lm-error">{error}</div>}

        <button type="submit" className="lm-btn-primary">
          <Lock size={14} /> LOGIN
        </button>
      </form>

      <div className="lm-switch-hint">Don't have an account?</div>
      <button onClick={() => onSwitchTab("signup")} className="lm-btn-outline">
        <User size={14} /> SIGN UP
      </button>
    </>
  );
}
