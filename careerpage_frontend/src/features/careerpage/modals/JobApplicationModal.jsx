import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, FileText } from "lucide-react";
import { toast } from "sonner";
import "./css/JobApplicationModal.css";
import { MAROON } from "../../../lib/constants";
import logoImg from "../../../assets/logo.png";

const ALL_ROLES = [
  "Senior Mathematics Teacher", "English Language & Literature Teacher", "Physics Teacher",
  "School Counsellor", "Computer Science Teacher", "Physical Education Teacher",
  "Academic Coordinator", "Office Administrator", "Facilities & Maintenance Supervisor", "IT Support Technician",
];

const ALL_SKILLS = [
  "Curriculum Development", "Classroom Management", "Student Assessment", "Communication", "Leadership",
  "Team Collaboration", "Microsoft Office", "Data Analysis", "Project Management", "Problem Solving",
  "CBSE Curriculum", "Digital Literacy", "Research & Development", "Counselling", "Event Management",
  "Administration", "IT Support", "Sports Coaching", "Content Creation", "Public Speaking",
];

function SkillsMultiSelect({ options, selected, onChange, placeholder, readOnly = false }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const wrapperRef = useRef(null);

  // Close the dropdown when clicking anywhere outside this component.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (opt) => {
    if (readOnly) return;
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  const addCustom = () => {
    if (readOnly) return;
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) onChange([...selected, trimmed]);
    setCustom("");
  };

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <div
        onClick={() => !readOnly && setOpen(!open)}
        className={`jm-multiselect-trigger ${readOnly ? "jm-multiselect-trigger--readonly" : "jm-multiselect-trigger--editable"}`}
      >
        {selected.length === 0 && <span className="jm-multiselect-placeholder">{placeholder}</span>}
        {selected.map((s) => (
          <span
            key={s}
            onClick={(e) => { e.stopPropagation(); if (readOnly) return; toggle(s); }}
            className={`jm-multiselect-tag ${readOnly ? "jm-multiselect-tag--readonly" : "jm-multiselect-tag--editable"}`}
          >
            {s}{!readOnly && " ×"}
          </span>
        ))}
        {!readOnly && (
          <span
            className="jm-multiselect-arrow"
            style={{ transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)` }}
          >▼</span>
        )}
      </div>

      {open && !readOnly && (
        <div className="jm-multiselect-dropdown">
          <div className="jm-multiselect-custom-row">
            <input
              className="jm-multiselect-custom-input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add custom…"
            />
            <button type="button" onClick={addCustom} className="jm-multiselect-add-btn">Add</button>
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              className={`jm-multiselect-option ${selected.includes(opt) ? "jm-multiselect-option--selected" : "jm-multiselect-option--unselected"}`}
            >
              {opt}
              {selected.includes(opt) && <Check size={13} color={MAROON} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const JobApplicationModal = ({ job, onClose, onSubmit, onEditProfile, profileData, resumeFile, resumeUrl, draftData, savedProfileData, scrollToSection }) => {
  const [submitted, setSubmitted] = useState(false);

  const [education, setEducation] = useState(draftData?.education ?? savedProfileData?.education ?? "");
  const [degreeName, setDegreeName] = useState(draftData?.degreeName ?? savedProfileData?.degreeName ?? "");
  const [professionalQual, setProfessionalQual] = useState(draftData?.professionalQual ?? savedProfileData?.professionalQualification ?? "");
  const [professionalQualOther, setProfessionalQualOther] = useState(draftData?.professionalQualOther ?? savedProfileData?.professionalQualificationOther ?? "");
  const [experience, setExperience] = useState(draftData?.experience ?? savedProfileData?.experience ?? "");
  const [salary, setSalary] = useState(draftData?.salary ?? savedProfileData?.salary ?? "");
  const [extracurricular, setExtracurricular] = useState(draftData?.extracurricular ?? savedProfileData?.extracurricular ?? "");
  const [extracurricularOther, setExtracurricularOther] = useState(draftData?.extracurricularOther ?? savedProfileData?.extracurricularOther ?? "");
  const [selectedRoles, setSelectedRoles] = useState(draftData?.selectedRoles ?? savedProfileData?.selectedRoles ?? []);
  const [selectedSkills, setSelectedSkills] = useState(draftData?.selectedSkills ?? savedProfileData?.selectedSkills ?? []);
  const [linkedin, setLinkedin] = useState(draftData?.linkedin ?? savedProfileData?.linkedin ?? "");
  const [portfolio, setPortfolio] = useState(draftData?.portfolio ?? savedProfileData?.portfolio ?? "");

  const [coverLetter, setCoverLetter] = useState(draftData?.coverLetter ?? "");
  const [availability, setAvailability] = useState(draftData?.availability ?? "");
  const [hasReferral, setHasReferral] = useState(draftData?.hasReferral ?? "No");
  const [referralEmpId, setReferralEmpId] = useState(draftData?.referralEmpId ?? "");

  const personalSectionRef = useRef(null);
  const professionalSectionRef = useRef(null);
  const resumeSectionRef = useRef(null);

  useEffect(() => {
    if (scrollToSection) {
      setTimeout(() => {
        if (scrollToSection === "personal") personalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        else if (scrollToSection === "professional") professionalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        else if (scrollToSection === "resume") resumeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
  }, [scrollToSection]);

  const handleEditProfileClick = (section = "personal") => {
    onEditProfile({ education, degreeName, professionalQual, professionalQualOther, experience, salary, extracurricular, extracurricularOther, selectedRoles, selectedSkills, linkedin, portfolio, coverLetter, availability, hasReferral, referralEmpId }, section);
  };

  const handleViewResume = () => {
    if (resumeUrl) { window.open(resumeUrl, "_blank"); return; }
    const fullName = [profileData.firstName, profileData.lastName].filter(Boolean).join(" ") || "Candidate Profile";
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume Preview</title><style>body{font-family:'Inter',system-ui,sans-serif;background:#f3f4f6;margin:0;padding:40px 20px;color:#1f2937}.container{max-width:800px;margin:0 auto;background:#fff;padding:50px 60px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.05)}.name{font-size:32px;font-weight:800;color:#72102a}.alert-banner{background:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:12px;border-radius:8px;font-size:12px;text-align:center;margin-top:40px}</style></head><body><div class="container"><div class="name">${fullName}</div><p>Resume: ${resumeFile}</p><div class="alert-banner">This is a generated preview for: <strong>${resumeFile}</strong>.</div></div></body></html>`;
    const blob = new Blob([htmlContent], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  if (!job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!profileData.firstName?.trim() || !profileData.lastName?.trim() || !profileData.email?.trim() || !profileData.phone?.trim() || !profileData.location?.trim()) {
      toast.error("Please complete all personal information fields in your profile before applying."); return;
    }
    if (!education) { toast.error("Educational Qualification is required"); return; }
    if (!degreeName.trim()) { toast.error("Degree Name is required"); return; }
    if (!experience) { toast.error("Years of Experience is required"); return; }
    if (!salary) { toast.error("Salary Expectations is required"); return; }
    if (selectedRoles.length === 0) { toast.error("Please select at least one Role Interested In"); return; }
    if (selectedSkills.length === 0) { toast.error("Please select at least one Skill / Strength"); return; }
    if (!coverLetter.trim()) { toast.error("Cover Letter is required"); return; }
    if (!availability) { toast.error("Notice Period is required"); return; }
    if (hasReferral === "Yes" && !referralEmpId.trim()) { toast.error("Please enter the Employee ID for the referral"); return; }
    if (!resumeFile) { toast.error("Please upload your resume in your profile dashboard before applying for this job"); return; }

    onSubmit(job.id, { coverLetter, noticePeriod: availability, hasReferral, referralEmpId }, {
      education, degreeName, professionalQualification: professionalQual, professionalQualificationOther: professionalQualOther,
      experience, salary, extracurricular, extracurricularOther, selectedRoles, selectedSkills, linkedin, portfolio,
    });
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="jm-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="jm-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose} className="jm-close-btn">
            <X size={15} color="#fff" />
          </button>

          {/* Header */}
          <div className="jm-header">
            <h2 className="jm-header-title">{job.title}</h2>
            <div className="jm-header-meta">
              <span>{job.department}</span>
              <span className="jm-header-sep">·</span>
              <span>{job.location}</span>
              <span className="jm-header-sep">·</span>
              <span>{job.type}</span>
            </div>
          </div>

          {submitted ? (
            /* ── Success ─────────────────────────────────────────────── */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="jm-success"
            >
              <img src={logoImg} alt="South Point School Guwahati" className="jm-success-logo" />
              <h3 className="jm-success-title">Application Submitted Successfully!</h3>
              <div className="jm-success-divider"></div>
              <p className="jm-success-msg">
                Thank you for applying for <strong>{job.title}</strong> at <strong>South Point School, Guwahati</strong>. 
                Your job application has been registered, and our selection committee will review it.
              </p>
              <div className="jm-success-next-steps">
                <h4>What's Next?</h4>
                <ul>
                  <li>Your qualification profile will be compared against the role's requirements.</li>
                  <li>An automated confirmation email has been sent to you.</li>
                  <li>Our recruitment officer will contact you if your profile is shortlisted for interviews.</li>
                </ul>
              </div>
              <button onClick={onClose} className="jm-success-close">Return to Careers</button>
            </motion.div>
          ) : (
            /* ── Form ────────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="jm-form-body">

              {/* Personal Information (read-only) */}
              <div ref={personalSectionRef} className="jm-section">
                <h3 className="jm-section-title">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div><label className="jm-label">First Name <span className="jm-required">*</span></label><input className="jm-input jm-input--readonly" value={profileData.firstName} readOnly /></div>
                  <div><label className="jm-label">Last Name <span className="jm-required">*</span></label><input className="jm-input jm-input--readonly" value={profileData.lastName} readOnly /></div>
                  <div className="jm-field-full"><label className="jm-label">Email Address <span className="jm-required">*</span></label><input className="jm-input jm-input--readonly" value={profileData.email} readOnly /></div>
                  <div><label className="jm-label">Phone <span className="jm-required">*</span></label><input className="jm-input jm-input--readonly" value={profileData.phone} readOnly /></div>
                  <div><label className="jm-label">Current Location <span className="jm-required">*</span></label><input className="jm-input jm-input--readonly" value={profileData.location} readOnly /></div>
                </div>
                <button type="button" onClick={() => handleEditProfileClick("personal")} className="jm-edit-profile-btn">Edit Profile</button>
              </div>

              {/* Professional Information (read-only) */}
              <div ref={professionalSectionRef} className="jm-section">
                <h3 className="jm-section-title">Professional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="jm-label">Educational Qualification <span className="jm-required">*</span></label>
                    <select required className="jm-select jm-select--readonly" value={education} disabled>
                      <option value="">Select education</option><option>High School / 12th</option><option>Diploma</option><option>Bachelor's Degree</option><option>Master's Degree</option><option>M.Phil</option><option>PhD / Doctorate</option><option>B.Ed / M.Ed</option>
                    </select>
                  </div>
                  <div><label className="jm-label">Degree Name <span className="jm-required">*</span></label><input required className="jm-input jm-input--readonly" placeholder="e.g. M.Sc Mathematics" value={degreeName} readOnly /></div>
                  <div>
                    <label className="jm-label">Professional Qualification <span className="jm-optional">(Optional)</span></label>
                    <select className="jm-select jm-select--readonly" value={professionalQual} disabled>
                      <option value="">Select qualification</option><option>B.Ed (Bachelor of Education)</option><option>M.Ed (Master of Education)</option><option>CTET / STET Certified</option><option>NET / SET Qualified</option><option>NTT (Nursery Teacher Training)</option><option>D.El.Ed (Diploma in Elementary Education)</option><option>PG Diploma in Education</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className="jm-label">Degree Name</label><input className="jm-input jm-input--readonly" placeholder="e.g. B.Ed, CTET, NET" value={professionalQualOther} readOnly /></div>
                  <div>
                    <label className="jm-label">Years of Experience <span className="jm-required">*</span></label>
                    <select required className="jm-select jm-select--readonly" value={experience} disabled>
                      <option value="">Select experience</option><option>0–1 years (Fresher)</option><option>1–3 years</option><option>3–5 years</option><option>5–8 years</option><option>8+ years</option>
                    </select>
                  </div>
                  <div className="sm:col-start-1">
                    <label className="jm-label">Extracurricular Qualification <span className="jm-optional">(Optional)</span></label>
                    <select className="jm-select jm-select--readonly" value={extracurricular} disabled>
                      <option value="">Select qualification</option><option>Sports Coaching</option><option>Music / Performing Arts</option><option>Drama / Theatre</option><option>Visual Arts / Craft</option><option>Debate / Public Speaking</option><option>Yoga / Physical Education</option><option>Scouting / NCC</option><option>Community Service / Social Work</option><option>STEM / Robotics Club</option><option>Environmental Activities</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className="jm-label">Degree Name</label><input className="jm-input jm-input--readonly" placeholder="e.g. Sports Coach, Music Diploma" value={extracurricularOther} readOnly /></div>
                </div>
                <div className="jm-field-mt"><label className="jm-label">Roles Interested In</label><SkillsMultiSelect options={ALL_ROLES} selected={selectedRoles} onChange={setSelectedRoles} placeholder="Select one or more roles…" readOnly /></div>
                <div className="jm-field-mt"><label className="jm-label">Skills &amp; Strengths</label><SkillsMultiSelect options={ALL_SKILLS} selected={selectedSkills} onChange={setSelectedSkills} placeholder="Select your skills…" readOnly /></div>
                <div className="jm-field-mt grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="jm-label">Salary Expectations (₹ per annum) <span className="jm-required">*</span></label>
                    <select required className="jm-select jm-select--readonly" value={salary} disabled>
                      <option value="">Select expected salary</option><option value="200000">₹2,00,000</option><option value="300000">₹3,00,000</option><option value="400000">₹4,00,000</option><option value="500000">₹5,00,000</option><option value="600000">₹6,00,000</option><option value="700000">₹7,00,000</option><option value="800000">₹8,00,000</option><option value="1000000">₹10,00,000</option><option value="1200000">₹12,00,000+</option>
                    </select>
                  </div>
                  <div className="hidden sm:block" />
                  <div><label className="jm-label">LinkedIn Profile <span className="jm-optional">(Optional)</span></label><input className="jm-input jm-input--readonly" placeholder="https://linkedin.com/in/yourname" value={linkedin} readOnly /></div>
                  <div><label className="jm-label">Portfolio / GitHub / Other <span className="jm-optional">(Optional)</span></label><input className="jm-input jm-input--readonly" placeholder="https://github.com/username" value={portfolio} readOnly /></div>
                </div>
                <button type="button" onClick={() => handleEditProfileClick("professional")} className="jm-edit-profile-btn">Edit Profile</button>
              </div>

              {/* Additional Information */}
              <div className="jm-section">
                <div className="jm-field-mb">
                  <label className="jm-label">Cover Letter / Why this role? <span className="jm-required">*</span></label>
                  <textarea required rows={4} placeholder="Tell us why you're interested in this role and what makes you a great fit…" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="jm-input jm-textarea" />
                </div>
                <div className="jm-field-mb">
                  <label className="jm-label">Notice Period <span className="jm-required">*</span></label>
                  <select required className="jm-select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="">Select notice period</option><option value="Immediate">Immediate</option><option value="7 Days">7 Days</option><option value="15 Days">15 Days</option><option value="30 Days">30 Days</option><option value="45 Days">45 Days</option><option value="60 Days">60 Days</option>
                  </select>
                </div>
                <div className="jm-field-mb">
                  <label className="jm-label">Referral <span className="jm-optional">(Optional)</span></label>
                  <select className="jm-select" value={hasReferral} onChange={(e) => { setHasReferral(e.target.value); if (e.target.value === "No") setReferralEmpId(""); }}>
                    <option value="No">No</option><option value="Yes">Yes</option>
                  </select>
                </div>
                {hasReferral === "Yes" && (
                  <div className="jm-field-mb">
                    <label className="jm-label">Employee ID <span className="jm-required">*</span></label>
                    <input className="jm-input" placeholder="Enter employee ID" value={referralEmpId} onChange={(e) => setReferralEmpId(e.target.value)} required />
                  </div>
                )}
              </div>

              {/* CV / Resume */}
              <div ref={resumeSectionRef} className="jm-section">
                <h3 className="jm-section-title">CV / Resume <span className="jm-required">*</span></h3>
                {resumeFile ? (
                  <div className="jm-resume-card">
                    <div className="jm-resume-row">
                      <FileText size={20} className="jm-resume-icon" />
                      <div style={{ flex: 1 }}>
                        <div className="jm-resume-name">{resumeFile}</div>
                        <div className="jm-resume-sub">Uploaded in your profile</div>
                      </div>
                    </div>
                    <div className="jm-resume-actions">
                      <button type="button" onClick={handleViewResume} className="jm-btn-view">View</button>
                      <button type="button" onClick={() => handleEditProfileClick("resume")} className="jm-btn-update">Update in My Profile</button>
                    </div>
                  </div>
                ) : (
                  <div className="jm-no-resume">
                    <div className="jm-no-resume-msg">No resume found in your profile. Please upload a resume to apply.</div>
                    <button type="button" onClick={() => handleEditProfileClick("resume")} className="jm-btn-upload-resume">Upload Resume in Profile</button>
                  </div>
                )}
              </div>

              <button type="submit" className="jm-btn-submit">
                Submit Application
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobApplicationModal;
