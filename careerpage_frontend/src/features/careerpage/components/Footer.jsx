import logoImg from "../../../assets/logo.png";
import "./css/Footer.css";

const FOOTER_LINKS = ["Privacy Policy", "Terms of Use", "Accessibility", "Contact Us"];

export function Footer() {
  return (
    <footer className="footer py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="South Point School" className="h-9 w-auto object-contain" />
          <span className="footer-school-name">South Point School · Guwahati, Assam</span>
        </div>

        {/* ── Nav links ──────────────────────────────────────────────────── */}
        <div className="footer-links flex flex-wrap gap-6 justify-center">
          {FOOTER_LINKS.map((l) => (
            <a key={l} href="#" className="footer-link">{l}</a>
          ))}
        </div>

        {/* ── Copyright ──────────────────────────────────────────────────── */}
        <div className="footer-copy">© 2026 South Point School. All rights reserved.</div>

      </div>
    </footer>
  );
}
