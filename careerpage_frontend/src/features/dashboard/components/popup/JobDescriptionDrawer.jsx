import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import "../css/popup/JobDescriptionDrawer.css";

export function JobDescriptionDrawer({
  selectedJobDesc,
  appliedJobIds = [],
  applicationsData = {},
  onClose,
}) {
  return (
    <AnimatePresence>
      {selectedJobDesc && (
        <div
          className="jd-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="jd-panel"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="jd-close-btn"
            >
              <X size={18} />
            </button>

            {/* Title & Department */}
            <h2 className="jd-title">
              {selectedJobDesc.title}
            </h2>
            <div className="jd-subtitle">
              {selectedJobDesc.department} &bull; {selectedJobDesc.location}
            </div>

            {/* Job Info Pills */}
            <div className="jd-pills">
              <span className="jd-pill--type">
                {selectedJobDesc.type}
              </span>
              <span className="jd-pill--deadline">
                Deadline: {selectedJobDesc.deadline}
              </span>
            </div>

            {/* Description */}
            <div className="jd-section">
              <h4 className="jd-section-title">
                Job Description
              </h4>
              <p className="jd-description">
                {selectedJobDesc.description}
              </p>
            </div>

            {/* Qualifications */}
            {selectedJobDesc.qualifications && selectedJobDesc.qualifications.length > 0 && (
              <div className="jd-section">
                <h4 className="jd-section-title">
                  Required Qualifications
                </h4>
                <ul className="jd-qual-list">
                  {selectedJobDesc.qualifications.map((qual, idx) => (
                    <li
                      key={idx}
                      className="jd-qual-item"
                    >
                      {qual}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Information Submitted */}
            {appliedJobIds.includes(selectedJobDesc.id) && (
              <div className="jd-additional">
                <h4 className="jd-additional-title">
                  Your Additional Information
                </h4>
                {(() => {
                  const appData = applicationsData[selectedJobDesc.id] || {
                    coverLetter: "Interested in the position.",
                    noticePeriod: "Immediate",
                    hasReferral: "No",
                    referralEmpId: "",
                  };
                  return (
                    <div className="jd-info-box">
                      <div>
                        <span className="jd-info-label">
                          Notice Period
                        </span>
                        <div className="jd-info-value">
                          {appData.noticePeriod}
                        </div>
                      </div>
                      <div>
                        <span className="jd-info-label">
                          Referral Information
                        </span>
                        <div className="jd-info-value">
                          {appData.hasReferral === "Yes" ? `Yes (Employee ID: ${appData.referralEmpId})` : "No Referral"}
                        </div>
                      </div>
                      {appData.coverLetter && (
                        <div>
                          <span className="jd-info-label">
                            Cover Letter / SOP
                          </span>
                          <div className="jd-info-value--pre">
                            {appData.coverLetter}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Action Button */}
            <div className="jd-footer">
              <button
                onClick={onClose}
                className="jd-btn-close"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
