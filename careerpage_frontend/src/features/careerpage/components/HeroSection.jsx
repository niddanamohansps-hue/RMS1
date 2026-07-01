import { motion } from "motion/react";
import { Award, TrendingUp, Users, Heart } from "lucide-react";
import { stats } from "../../../mockData/jobs";
import campusImg from "../../../assets/campus.jpg";
import "./css/HeroSection.css";

const TRUST_INDICATORS = [
  { icon: Award,      text: "60+ Years of Excellence"      },
  { icon: TrendingUp, text: "Career Growth Opportunities"  },
  { icon: Users,      text: "Inclusive Community"          },
  { icon: Heart,      text: "Meaningful Impact"            },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function HeroSection({ loggedInUser }) {
  return (
    <section className="hero-section relative overflow-hidden">
      {/* ── Background campus image ───────────────────────────────────── */}
      <img
        src={campusImg}
        alt="South Point School Campus"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ── Gradient overlay ──────────────────────────────────────────── */}
      <div className="hero-overlay absolute inset-0" />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="hero-content relative max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="hero-heading">
              Build Your Future.
              <br />
              <span className="hero-heading-accent">Shape the Next Generation.</span>
            </h1>

            <p className="hero-subtext mt-5 max-w-lg">
              At South Point School, every role contributes to excellence in education and character building.
              Join a community that inspires, supports, and empowers future generations.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#opportunities"
                onClick={(e) => { e.preventDefault(); scrollTo("opportunities"); }}
                className="hero-btn-primary px-7 py-3"
              >
                Explore Opportunities
              </a>

              {!loggedInUser && (
                <button
                  onClick={() => scrollTo("apply-anyway")}
                  className="hero-btn-outline px-7 py-3"
                >
                  Submit Profile
                </button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {TRUST_INDICATORS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={14} className="trust-icon" />
                  <span className="trust-text">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col justify-center gap-8"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="stat-item">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
