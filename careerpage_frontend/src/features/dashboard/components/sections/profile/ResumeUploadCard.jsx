import React from "react";
import { FileText, Eye, Download, Upload } from "lucide-react";
import "../../css/sections/profile/ResumeUploadCard.css";

export function ResumeUploadCard({
  resumeFile,
  resumeUrl,
  fileSizeError,
  handleResumeUpload,
  handleViewResume,
  sectionRef,
}) {
  const fileInputRef = React.useRef(null);

  return (
    <div
      ref={sectionRef}
      className="ru-card"
    >
      <h2 className="ru-title">
        CV / Resume
      </h2>
      <div className="ru-status-box">
        <div className="ru-status-title">
          Current Resume
        </div>
        {resumeFile ? (
          <>
            <div className="ru-file-info">
              <FileText size={13} color="#72102a" /> {resumeFile}
            </div>
            <div className="ru-actions-row">
              <button
                onClick={handleViewResume}
                className="ru-btn-action"
              >
                <Eye size={14} /> View Resume
              </button>
              <a
                href={resumeUrl || "#"}
                download={resumeFile}
                className="ru-btn-action"
              >
                <Download size={14} /> Download
              </a>
            </div>
          </>
        ) : (
          <div className="ru-empty-text">
            No resume uploaded yet.
          </div>
        )}
      </div>
      <div
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className="ru-dropzone"
      >
        <Upload size={28} color="#72102a" className="ru-upload-icon" />
        <div className="ru-dropzone-title">
          {resumeFile ? "Replace Resume" : "Upload Resume"}
        </div>
        <div className="ru-dropzone-subtitle">
          PDF, DOC or DOCX &bull; Maximum 5 MB
        </div>
        {fileSizeError && <div className="ru-error-msg">{fileSizeError}</div>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="ru-hidden-input"
          onChange={handleResumeUpload}
        />
      </div>
    </div>
  );
}
