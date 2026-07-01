import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { CATEGORIES } from "../../../mockData/jobs";
import { useJobFilters } from "../hooks/useJobFilters";
import { JobCard } from "./JobCard";
import "./css/OpportunitiesSection.css";

// "Current Opportunities" — search box, category filters and the job grid
// with progressive "See More" paging.
export function OpportunitiesSection({ onApplyJob, appliedJobIds }) {
  const {
    search,
    activeCategory,
    showAll,
    setShowAll,
    filteredJobs,
    visibleJobs,
    onSearchChange,
    onCategoryChange,
    JOBS_VISIBLE,
  } = useJobFilters();

  return (
    <section id="opportunities" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="os-eyebrow">Open Positions</p>

          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <h2 className="os-heading">Current Opportunities</h2>

            <div className="os-count-pill">
              <span className="os-count-number">{filteredJobs.length}</span>
              <span className="os-count-label">
                Position{filteredJobs.length !== 1 ? "s" : ""} Available
              </span>
            </div>
          </div>

          <div className="os-divider" />
        </motion.div>

        {/* ── Search & Filters ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="os-search-icon" />
            <input
              type="text"
              placeholder="Search by title or department…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="os-search-input py-3"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`os-filter-btn px-4 py-2.5 ${
                  activeCategory === cat ? "os-filter-btn--active" : "os-filter-btn--inactive"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Job listings ────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleJobs.length > 0 ? (
              visibleJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <JobCard
                    job={job}
                    applied={appliedJobIds.includes(job.id)}
                    onApply={onApplyJob}
                    showOverlay={!showAll && i === visibleJobs.length - 1 && filteredJobs.length > JOBS_VISIBLE}
                    onSeeMore={() => setShowAll(true)}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                <p className="os-empty-msg">
                  No positions found matching your search. Try a different keyword or category.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Show Less ───────────────────────────────────────────────────── */}
        {filteredJobs.length > JOBS_VISIBLE && showAll && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setShowAll(false);
                setTimeout(() => document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" }), 10);
              }}
              className="os-show-less-btn px-10 py-3"
            >
              Show Less
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
