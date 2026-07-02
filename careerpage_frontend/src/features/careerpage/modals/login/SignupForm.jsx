import { useState } from "react";
import { User, Mail, Phone, Lock, EyeOff, Eye } from "lucide-react";
import { authService } from "./authService";

const capitalizeWords = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

export function SignupForm({ onSignupSuccess, onClose, onSwitchTab }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!firstName || !email || !phone || !password || !confirm) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(firstName.trim())) {
      setError("First name must contain alphabets only.");
      return;
    }
    if (lastName && !/^[a-zA-Z\s]*$/.test(lastName.trim())) {
      setError("Last name must contain alphabets only.");
      return;
    }
    if (phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await authService.signup({
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword: confirm,
      });

      setError("");
      if (onSignupSuccess) {
        onSignupSuccess({ name: firstName, lastName, email, phone });
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Registration failed. Email might already exist.");
    }
  };

  return (
    <>
      <div className="lm-section-heading">
        <div className="lm-section-title">Create Account</div>
        <div className="lm-section-sub">Join South Point School's portal</div>
      </div>

      <form onSubmit={handleSignup} className="lm-form">
        <div className="lm-name-grid">
          <div className="lm-input-wrap">
            <User size={15} className="lm-input-icon" />
            <input
              type="text"
              placeholder="First Name *"
              required
              value={firstName}
              onChange={(e) =>
                setFirstName(
                  capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                )
              }
              className="lm-input"
            />
          </div>
          <div className="lm-input-wrap">
            <User size={15} className="lm-input-icon" />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) =>
                setLastName(
                  capitalizeWords(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                )
              }
              className="lm-input"
            />
          </div>
        </div>

        <div className="lm-input-wrap">
          <Mail size={15} className="lm-input-icon" />
          <input
            type="email"
            placeholder="Email Address *"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lm-input"
          />
        </div>

        <div className="lm-input-wrap">
          <Phone size={15} className="lm-input-icon" />
          <input
            type="tel"
            placeholder="Phone Number *"
            inputMode="numeric"
            maxLength={10}
            required
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="lm-input"
          />
          <span
            className={`lm-phone-count ${
              phone.length === 10 ? "lm-phone-count--ok" : "lm-phone-count--pending"
            }`}
          >
            {phone.length}/10
          </span>
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
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          <User size={14} /> REGISTER
        </button>
      </form>

      <div className="lm-switch-hint">Already have an account?</div>
      <button onClick={() => onSwitchTab("login")} className="lm-btn-outline">
        <Lock size={14} /> LOGIN
      </button>
    </>
  );
}
