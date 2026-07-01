import { useState, useEffect } from "react";
import { T, font, radius, shadow } from "../theme";
import { api } from "../lib/api";

const DEFAULT_USERS = [
  { email: "admin@school.edu", password: "admin123", name: "Principal Admin", role: "admin" },
  { email: "dr.roy@school.edu", password: "roy123", name: "Dr. Roy", role: "Dr. Roy" },
  { email: "mr.patel@school.edu", password: "patel123", name: "Mr. Patel", role: "Mr. Patel" },
  { email: "ms.nisha@school.edu", password: "nisha123", name: "Ms. Nisha", role: "Ms. Nisha" },
];

function FormLabel({ text }) {
  return (
    <label style={{
      fontSize: 11,
      fontWeight: "800",
      color: "#374151",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 5,
      display: "block",
    }}>
      {text}
    </label>
  );
}

function CustomInput({ icon, type = "text", placeholder, value, onChange, showPasswordToggle, onToggleShowPassword }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      border: `1.5px solid #d1d5db`,
      borderRadius: 12,
      background: "#fff",
      overflow: "hidden",
      transition: "border-color 0.2s",
      width: "100%",
    }}
    className="input-focus-container"
    >
      <div style={{
        width: 38,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1.5px solid #e5e7eb",
        color: T.primary,
        background: "rgba(114, 16, 42, 0.02)",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "8px 12px",
          fontSize: 14,
          fontFamily: font.body,
          color: T.ink,
          background: "transparent",
          width: "100%",
        }}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onToggleShowPassword}
          style={{
            background: "none",
            border: "none",
            padding: "0 12px",
            cursor: "pointer",
            color: "#6B6B6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {type === "password" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export default function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {}
  }, []);

  const getUsers = () => {
    try {
      const stored = localStorage.getItem("users");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const tokenData = await api.post("/auth/login/", {
        email: email.trim(),
        password: password,
      });

      localStorage.setItem("access_token", tokenData.access);
      localStorage.setItem("refresh_token", tokenData.refresh);

      const profile = await api.get("/auth/me/");

      if (profile.role !== "admin") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setError("Only HR Admins and Panelists can log in here.");
        return;
      }

      let panelists = [];
      try {
        const res = await api.get("/panelists/");
        panelists = res.results ? res.results : (Array.isArray(res) ? res : []);
      } catch (err) {
        console.warn("Failed to fetch panelists list", err);
      }

      const foundPanelist = Array.isArray(panelists) ? panelists.find(
        (p) => p.email && p.email.toLowerCase() === profile.email.toLowerCase()
      ) : null;

      let matchedUser;
      if (foundPanelist) {
        matchedUser = {
          email: profile.email,
          name: foundPanelist.name,
          role: foundPanelist.name,
        };
      } else {
        matchedUser = {
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
        };
      }

      try {
        if (rememberMe) {
          localStorage.setItem("remembered_email", email.trim());
        } else {
          localStorage.removeItem("remembered_email");
        }
      } catch (err) {}

      setSuccess("Login successful!");
      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 500);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const users = getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: "admin",
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setSuccess("Account created successfully! You can now Log in.");
    setTimeout(() => {
      setTab("login");
      setEmail(newUser.email);
      setPassword("");
      setError("");
      setSuccess("");
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(135deg, rgba(92, 12, 33, 0.55) 0%, rgba(30, 3, 10, 0.75) 100%), url('/school_campus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: 20,
        fontFamily: font.body,
        boxSizing: "border-box",
      }}
    >
      <div
        className="animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: 420,
          background: T.surface,
          borderRadius: 24,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          border: `1.5px solid ${T.accent}44`,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
            padding: "20px 24px 16px",
            textAlign: "center",
            borderBottom: `2.5px solid ${T.accent}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <img
            src="/images-removebg-preview.png"
            alt="South Point School Logo"
            style={{ height: 48, width: "auto", objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: "bold",
                fontFamily: "Georgia, serif",
                color: T.accent,
                letterSpacing: "0.01em",
              }}
            >
              South Point School
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <div style={{ width: 16, height: 1, background: "rgba(255, 255, 255, 0.3)" }} />
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                HR Recruitment Portal
              </p>
              <div style={{ width: 16, height: 1, background: "rgba(255, 255, 255, 0.3)" }} />
            </div>
            <div style={{ fontSize: 8, color: T.accent, marginTop: 3, lineHeight: 1 }}>◆</div>
          </div>
        </div>

        {/* Auth Forms */}
        <div style={{ padding: "24px" }}>
          {error && (
            <div
              style={{
                background: T.redLight,
                border: `1px solid ${T.red}33`,
                color: T.red,
                padding: "8px 12px",
                borderRadius: radius.md,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 14,
                lineHeight: 1.4,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: T.greenLight,
                border: `1px solid ${T.green}33`,
                color: T.green,
                padding: "8px 12px",
                borderRadius: radius.md,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 14,
                lineHeight: 1.4,
              }}
            >
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <FormLabel text="Email Address" />
              <CustomInput
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                }
                type="email"
                placeholder="e.g. admin@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <FormLabel text="Password" />
              <CustomInput
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPasswordToggle={true}
                onToggleShowPassword={() => setShowPassword(!showPassword)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -6 }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                  accentColor: T.primary,
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.inkLight,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className="btn-hover"
              style={{
                background: `linear-gradient(135deg, ${T.primary} 0%, #4c0519 100%)`,
                border: "none",
                borderRadius: 99,
                padding: "10px 0",
                width: "100%",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 20px rgba(114, 16, 42, 0.2)",
                marginTop: 4,
                transition: "all 0.2s"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Log in</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
