import React from "react";
import { motion } from "motion/react";
import { ChevronRight, Calendar, MapPin } from "lucide-react";
import { MAROON } from "../../../../lib/constants";
import { getStatusClass, getStatusIcon } from "../../utils/statusHelper";
import "../css/sections/OverviewSection.css";
import "../css/data/statusBadges.css";

export function OverviewSection({ profile, dynamicApplications, setActiveTab }) {
  const stats = [
    {
      label: "Total Applied",
      value: dynamicApplications.length,
      color: MAROON,
    },
    {
      label: "Shortlisted",
      value: dynamicApplications.filter((j) => j.status === "Shortlisted").length,
      color: "#065f46",
    },
    {
      label: "Interviews",
      value: dynamicApplications.filter((j) => j.status === "Interview Scheduled").length,
      color: "#1e40af",
    },
    {
      label: "Under Review",
      value: dynamicApplications.filter((j) => j.status === "Under Review").length,
      color: "#b45309",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="ov-page-title">
        Welcome back, {profile.name}!
      </h1>
      <p className="ov-page-sub">
        Here's an overview of your applications and activity.
      </p>

      {/* Stats Grid */}
      <div className="ov-stats-grid">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="ov-stat-card"
          >
            <div
              style={{ color }}
              className="ov-stat-value"
            >
              {value}
            </div>
            <div className="ov-stat-label">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications Section */}
      <div className="ov-recent-card">
        <div className="ov-recent-header">
          <h2 className="ov-recent-title">
            Recent Applications
          </h2>
          <button
            onClick={() => setActiveTab("applications")}
            className="ov-view-all-btn"
          >
            View All <ChevronRight size={13} />
          </button>
        </div>

        {dynamicApplications.length === 0 ? (
          <div className="ov-empty">
            <div className="ov-empty-title">No applications yet</div>
            <div className="ov-empty-sub">
              Apply for jobs on the careers page to see them here.
            </div>
          </div>
        ) : (
          dynamicApplications.slice(0, 3).map((job) => {
            const statusClass = getStatusClass(job.status);
            const statusIcon = getStatusIcon(job.status);
            return (
              <div
                key={job.id}
                className="ov-app-row"
              >
                <div>
                  <div className="ov-app-title">
                    {job.title}
                  </div>
                  <div className="ov-app-meta">
                    <span className="ov-app-meta-item">
                      <Calendar size={11} />
                      {job.appliedDate}
                    </span>
                    <span className="ov-app-meta-item">
                      <MapPin size={11} />
                      {job.location}
                    </span>
                  </div>
                </div>
                <span className={`ov-status-badge ${statusClass}`}>
                  {statusIcon}
                  {job.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
