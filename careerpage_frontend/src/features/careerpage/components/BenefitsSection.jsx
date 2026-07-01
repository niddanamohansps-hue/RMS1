import { motion } from "motion/react";
import { benefits } from "../../../mockData/jobs";
import "./css/BenefitsSection.css";

// "Why Build Your Career at South Point School?" — grid of benefit cards.
export function BenefitsSection() {
  return (
    <section id="benefits" className="benefits-section py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="benefits-eyebrow">What We Offer</p>

          <h2 className="benefits-heading">
            Why Build Your Career at South Point School?
          </h2>

          <div className="benefits-divider" />
        </motion.div>

        {/* ── Benefits grid ──────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ boxShadow: "0 8px 32px rgba(107,26,26,0.12)", y: -3 }}
            >
              <div className="benefit-icon-wrapper">
                <Icon size={22} className="benefit-icon" />
              </div>

              <h3 className="benefit-card-title">{title}</h3>

              <p className="benefit-card-desc">{desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
