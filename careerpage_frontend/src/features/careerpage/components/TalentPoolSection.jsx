import { motion } from "motion/react";
import { Briefcase, Mail } from "lucide-react";
import "./css/TalentPoolSection.css";

const HIGHLIGHTS = [
  { icon: Briefcase, text: "All academic and administrative disciplines" },
  { icon: Mail,      text: "Early notification for new openings"         },
];

// "Talent Pool" call-to-action shown only to logged-out visitors, inviting
// them to submit a general profile.
export function TalentPoolSection({ onSubmitProfile }) {
  return (
    <section id="apply-anyway" className="tp-section py-20 px-6">
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="tp-card p-10 md:p-14"
        >
          {/* ── Header ────────────────────────────────────────────────── */}
          <p className="tp-eyebrow">Talent Pool</p>

          <h2 className="tp-heading">Don't See Your Role Listed?</h2>

          <div className="tp-divider" />

          <p className="tp-body">
            Submit your profile to our talent pool and be the first to hear when a role
            matching your expertise opens up at South Point School.
          </p>

          {/* ── Highlights ────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-wrap justify-center gap-5 mb-10">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} className="tp-highlight-icon" />
                <span className="tp-highlight-text">{text}</span>
              </div>
            ))}
          </div>

          {/* ── CTA ───────────────────────────────────────────────────── */}
          <button onClick={onSubmitProfile} className="tp-btn px-12 py-4">
            Submit Profile
          </button>
        </motion.div>

      </div>
    </section>
  );
}
