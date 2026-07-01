import React from "react";
import { CheckCircle, XCircle, Eye, Upload, Trash2, Camera, Clock } from "lucide-react";
import "../../css/sections/onboarding/DocumentRow.css";

const verifConfig = {
  verified: {
    label: "Verified",
    color: "#065f46",
    bg: "#f0fdf4",
    border: "#6ee7b7",
    icon: <CheckCircle size={11} />,
  },
  pending: {
    label: "Under Review",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    icon: <Clock size={11} />,
  },
  rejected: {
    label: "Rejected",
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#fca5a5",
    icon: <XCircle size={11} />,
  },
};

/**
 * A single document upload row (upload / view / camera / remove + verification badge).
 * `children` is rendered between the row controls and the verification badge — used for
 * the inline Aadhaar / PAN / Bank detail fields tied to specific document keys.
 */
export function DocumentRow({
  docKey,
  label,
  accept,
  note,
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  docStatus = {},
  docsSubmitted,
  startDocCamera,
  children,
}) {
  const uploaded = docs[docKey];
  const verif = docsSubmitted && uploaded ? docStatus[docKey] || "pending" : null;

  return (
    <div className="dr-row-container">
      <div className="dr-row-header">
        <div className="dr-info">
          <div className="dr-label">{label}</div>
          <div className="dr-note">
            {uploaded ? uploaded : note}
          </div>
        </div>

        <div className="dr-controls">
          {uploaded ? (
            <>
              <div className="dr-badge-uploaded">
                <CheckCircle size={12} /> Uploaded
              </div>
              <button
                onClick={() => {
                  const url = docUrls[docKey];
                  if (url) {
                    window.open(url, "_blank");
                  }
                }}
                className="dr-btn-view hover:bg-[#f0f0f0]"
              >
                <Eye size={12} /> View
              </button>
              {!docsSubmitted && (
                <button
                  onClick={() => {
                    setDocs((prev) => {
                      const copy = { ...prev };
                      delete copy[docKey];
                      return copy;
                    });
                    setDocUrls((prev) => {
                      const copy = { ...prev };
                      delete copy[docKey];
                      return copy;
                    });
                  }}
                  className="dr-btn-remove"
                  title="Remove document"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          ) : !docsSubmitted ? (
            <>
              <label className="dr-pointer-label">
                <div className="dr-btn-upload-wrap">
                  <Upload size={12} /> Upload File
                </div>
                <input
                  type="file"
                  accept={accept}
                  className="dr-file-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = URL.createObjectURL(f);
                      setDocs((prev) => ({ ...prev, [docKey]: f.name }));
                      setDocUrls((prev) => ({ ...prev, [docKey]: url }));
                    }
                  }}
                />
              </label>
              <button
                onClick={() => startDocCamera(docKey)}
                className="dr-btn-camera hover:bg-[#f0f0f0]"
              >
                <Camera size={12} /> Take Photo
              </button>
            </>
          ) : (
            <span className="dr-missing-text">
              Missing document
            </span>
          )}
        </div>
      </div>

      {children}

      {verif && (
        <div
          style={{
            background: verifConfig[verif].bg,
            border: `1px solid ${verifConfig[verif].border}`,
            color: verifConfig[verif].color,
          }}
          className="dr-verification-badge"
        >
          {verifConfig[verif].icon} {verifConfig[verif].label}
        </div>
      )}
    </div>
  );
}
