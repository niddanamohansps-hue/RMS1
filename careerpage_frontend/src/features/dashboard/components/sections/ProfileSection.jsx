import React from "react";
import { motion } from "motion/react";
import { PersonalInfoCard } from "./profile/PersonalInfoCard";
import { ProfessionalInfoCard } from "./profile/ProfessionalInfoCard";
import { ResumeUploadCard } from "./profile/ResumeUploadCard";
import "../css/sections/ProfileSection.css";

export function ProfileSection({
  profile,
  setProfile,
  resumeFile,
  resumeUrl,
  fileSizeError,
  handleResumeUpload,
  handleViewResume,
  handleSave,
  saved,
  personalSectionRef,
  professionalSectionRef,
  resumeSectionRef,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="ps-page-title">
        My Profile & Resume
      </h1>
      <p className="ps-page-sub">
        Keep your profile updated to improve your chances.
      </p>

      <PersonalInfoCard
        profile={profile}
        setProfile={setProfile}
        sectionRef={personalSectionRef}
      />

      <ProfessionalInfoCard
        profile={profile}
        setProfile={setProfile}
        sectionRef={professionalSectionRef}
      />

      <ResumeUploadCard
        resumeFile={resumeFile}
        resumeUrl={resumeUrl}
        fileSizeError={fileSizeError}
        handleResumeUpload={handleResumeUpload}
        handleViewResume={handleViewResume}
        sectionRef={resumeSectionRef}
      />

      {/* Save Changes Button */}
      <button
        onClick={handleSave}
        className="ps-save-btn"
      >
        {saved ? "Saved ✓" : "Save Changes"}
      </button>
    </motion.div>
  );
}
