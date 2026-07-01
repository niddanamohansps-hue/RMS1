import React from "react";
import { motion } from "motion/react";
import { Briefcase, MapPin, Calendar, Eye } from "lucide-react";
import { MAROON } from "../../../../lib/constants";
import { getStatusClass, getStatusIcon } from "../../utils/statusHelper";
import "../css/sections/ApplicationsSection.css";
import "../css/data/statusBadges.css";

export function ApplicationsSection({
  dynamicApplications,
  allJobs,
  setSelectedJobDesc,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="as-page-title">
        My Applications
      </h1>
      <p className="as-page-sub">
        Track the status of all your submitted applications.
      </p>

      <div className="as-list">
        {dynamicApplications.length === 0 ? (
          <div className="as-empty">
            <Briefcase size={32} className="as-empty-icon" />
            <div className="as-empty-title">No applications yet</div>
            <div className="as-empty-sub">
              Apply for jobs on the careers page to see them here.
            </div>
          </div>
        ) : (
          dynamicApplications.map((job) => {
            const statusClass = getStatusClass(job.status);
            const statusIcon = getStatusIcon(job.status);
            return (
              <div
                key={job.id}
                className="as-card"
              >
                <div className="as-card-top">
                  <div className="as-card-body">
                    <div className="as-job-title">
                      {job.title}
                    </div>
                    <div className="as-job-dept">
                      {job.department}
                    </div>
                    <div className="as-job-meta">
                      <span className="as-meta-item">
                        <Briefcase size={12} color={MAROON} />
                        {job.type}
                      </span>
                      <span className="as-meta-item">
                        <MapPin size={12} color={MAROON} />
                        {job.location}
                      </span>
                      <span className="as-meta-item">
                        <Calendar size={12} color={MAROON} />
                        Applied: {job.appliedDate}
                      </span>
                    </div>
                  </div>
                  <span className={`as-status-badge ${statusClass}`}>
                    {statusIcon}
                    {job.status}
                  </span>
                </div>
                <div className="as-card-footer">
                  <button
                    onClick={() => {
                      const fullJob = allJobs.find((j) => j.id === job.id);
                      if (fullJob) setSelectedJobDesc(fullJob);
                    }}
                    className="as-btn-view"
                  >
                    <Eye size={12} /> View Job Description
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
