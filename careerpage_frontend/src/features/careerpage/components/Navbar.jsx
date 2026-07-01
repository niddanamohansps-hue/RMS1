import { useState, useEffect } from "react";
import logoImg from "../../../assets/logo.png";
import "./css/Navbar.css";

// Sticky top navigation. Shows Login/Sign Up when logged out, and
// Dashboard/Log Out when logged in. Mirrors the same actions in a
// full-screen overlay on mobile.
export function Navbar({ loggedInUser, onLogin, onSignup, onOpenDashboard, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMobileMenu = () => setIsOpen((prev) => !prev);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Reset viewport meta tag to force the mobile browser to recalculate scales
    // and layout width when returning from the external non-responsive site in the same tab.
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=5.0");
    const timer = setTimeout(() => {
      meta.setAttribute("content", "width=device-width, initial-scale=1.0");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <nav className="navbar sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">

            {/* ── Brand ───────────────────────────────────────────────────── */}
            <div
              className="navbar-brand flex items-center gap-3.5"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                closeMobileMenu();
              }}
            >
              <img src={logoImg} alt="South Point School Logo" className="h-11 w-auto object-contain" />
              <div>
                <div className="navbar-school-name">South Point School</div>
                <div className="navbar-school-sub">Guwahati, Assam</div>
              </div>
            </div>

            {/* ── Desktop buttons ──────────────────────────────────────────── */}
            <div className="hidden sm:flex items-center gap-2">
              <a
                href="https://www.spsghy.co.in"
                className="nb-btn nb-btn-outline px-3 py-1.5"
                style={{ textDecoration: "none" }}
              >
                Home
              </a>
              {loggedInUser ? (
                <>
                  <button onClick={onOpenDashboard} className="nb-btn nb-btn-outline px-3 py-1.5">
                    Dashboard
                  </button>
                  <button onClick={onLogout} className="nb-btn nb-btn-solid px-3 py-1.5">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onLogin} className="nb-btn nb-btn-outline px-3 py-1.5">
                    Login
                  </button>
                  <button onClick={onSignup} className="nb-btn nb-btn-solid px-3 py-1.5">
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ─────────────────────────────────────────── */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className={`nb-hamburger sm:hidden ${isOpen ? "is-active" : ""}`}
              aria-label="Toggle menu"
            >
              <span className="nb-hamburger-bar" />
              <span className="nb-hamburger-bar" />
              <span className="nb-hamburger-bar" />
            </button>

          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay and panel ───────────────────────────────── */}
      <div className={`nb-mobile-panel-wrapper ${isOpen ? "is-open" : ""}`}>
        <div className="nb-mobile-panel" onClick={(e) => e.stopPropagation()}>
          <div className="nb-mobile-actions">
            <a
              href="https://www.spsghy.co.in"
              className="nb-btn nb-btn-outline"
              style={{ textDecoration: "none" }}
              onClick={closeMobileMenu}
            >
              Home
            </a>
            {loggedInUser ? (
              <>
                <button
                  onClick={() => { onOpenDashboard(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-outline"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { onLogout(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-solid"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onLogin(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-outline"
                >
                  Login
                </button>
                <button
                  onClick={() => { onSignup(); closeMobileMenu(); }}
                  className="nb-btn nb-btn-solid"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
        <div className="nb-mobile-backdrop" onClick={closeMobileMenu} />
      </div>
    </>
  );
}

