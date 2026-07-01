import React from "react";
import { motion } from "motion/react";
import { Video, Calendar, User, Link as LinkIcon } from "lucide-react";
import { MAROON } from "../../../../lib/constants";
import { interviews } from "../../../../mockData/dashboardMockData";
import "../css/sections/InterviewsSection.css";

export function InterviewsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="is-page-title">
        Upcoming Interviews
      </h1>
      <p className="is-page-sub">
        Your scheduled interviews and meeting links.
      </p>

      <div className="is-list">
        {interviews.length === 0 ? (
          <div className="is-empty">
            <Video size={32} className="is-empty-icon" />
            <div className="is-empty-title">No interviews scheduled yet.</div>
          </div>
        ) : (
          interviews.map((iv) => (
            <div
              key={iv.id}
              className="is-card"
            >
              <div className="is-card-top">
                <div>
                  <div className="is-role">
                    {iv.role}
                  </div>
                  <div className="is-meta-row">
                    <span className="is-meta-item">
                      <Calendar size={12} color={MAROON} />
                      {iv.date} at {iv.time}
                    </span>
                    <span className="is-meta-item">
                      <User size={12} color={MAROON} />
                      {iv.interviewer}
                    </span>
                  </div>
                  <div className="is-mode-row">
                    <span
                      className={`is-mode-badge ${
                        iv.mode === "Online" ? "is-mode-badge--online" : "is-mode-badge--inperson"
                      }`}
                    >
                      {iv.mode}
                    </span>
                    {iv.platform && (
                      <span className="is-platform">
                        via {iv.platform}
                      </span>
                    )}
                  </div>
                </div>
                <span className="is-status-badge">
                  {iv.status}
                </span>
              </div>
              {iv.link && (
                <div className="is-link-box">
                  <div className="is-link-inner">
                    <LinkIcon size={14} color="#1e40af" />
                    <span className="is-link-label">
                      Meeting Link
                    </span>
                    <span className="is-link-url">
                      {iv.link}
                    </span>
                  </div>
                  <a
                    href={iv.link}
                    target="_blank"
                    rel="noreferrer"
                    className="is-join-btn"
                  >
                    <Video size={12} /> Join Interview
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
