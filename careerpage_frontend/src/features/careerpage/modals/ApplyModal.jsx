import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Upload, Linkedin, Check, Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import "./css/ApplyModal.css";
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

function SkillsMultiSelect({ options, selected, onChange, placeholder }) {
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
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) onChange([...selected, trimmed]);
    setCustom("");
  };

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <div onClick={() => setOpen(!open)} className="am-multiselect-trigger">
        {selected.length === 0 && <span className="am-multiselect-placeholder">{placeholder}</span>}
        {selected.map((s) => (
          <span key={s} onClick={(e) => { e.stopPropagation(); toggle(s); }} className="am-multiselect-tag">
            {s} ×
          </span>
        ))}
        <span
          className="am-multiselect-arrow"
          style={{ transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)` }}
        >▼</span>
      </div>

      {open && (
        <div className="am-multiselect-dropdown">
          <div className="am-multiselect-custom-row">
            <input
              className="am-multiselect-custom-input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add custom…"
            />
            <button type="button" onClick={addCustom} className="am-multiselect-add-btn">Add</button>
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              className={`am-multiselect-option ${selected.includes(opt) ? "am-multiselect-option--selected" : "am-multiselect-option--unselected"}`}
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

export function ApplyModal({ onClose, signupData, onSubmitData }) {
  const fileRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [firstName, setFirstName] = useState(signupData?.name || "");
  const [lastName, setLastName] = useState(signupData?.lastName || "");
  const [form, setForm] = useState({
    email: signupData?.email || "",
    phone: signupData?.phone || "",
    location: "",
    education: "",
    degreeName: "",
    professionalQualification: "",
    professionalQualificationOther: "",
    experience: "",
    salary: "",
    extracurricular: "",
    extracurricularOther: "",
    linkedin: "",
    portfolio: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim()) { toast.error("First name is required"); return; }
    if (!lastName.trim()) { toast.error("Last name is required"); return; }
    if (!form.phone.trim() || form.phone.length !== 10) { toast.error("Phone number must be exactly 10 digits"); return; }
    if (!form.location.trim()) { toast.error("Current Location is required"); return; }
    if (!form.education) { toast.error("Educational Qualification is required"); return; }
    if (!form.degreeName.trim()) { toast.error("Degree Name is required"); return; }
    if (!form.experience) { toast.error("Years of Experience is required"); return; }
    if (!form.salary) { toast.error("Salary Expectations is required"); return; }
    if (selectedRoles.length === 0) { toast.error("Please select at least one Role Interested In"); return; }
    if (selectedSkills.length === 0) { toast.error("Please select at least one Skill / Strength"); return; }
    if (!fileName) { toast.error("Please upload your CV / Resume"); return; }

    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const data = {
      fullName, email: form.email, phone: form.phone, location: form.location,
      education: form.education, degreeName: form.degreeName,
      professionalQualification: form.professionalQualification,
      professionalQualificationOther: form.professionalQualificationOther,
      experience: form.experience, salary: form.salary,
      extracurricular: form.extracurricular, extracurricularOther: form.extracurricularOther,
      selectedRoles, selectedSkills, linkedin: form.linkedin, portfolio: form.portfolio, resumeFile: fileName,
    };
    onSubmitData?.(data);
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="am-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="am-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose} className="am-close-btn">
            <X size={15} color="#fff" />
          </button>

          {/* Header */}
          <div className="am-header">
            <h2 className="am-header-title">My Profile</h2>
            <p className="am-header-sub">
              Submit a general application to South Point School Guwahati. We'll keep your information on file for suitable positions.
            </p>
          </div>

          {submitted ? (
            /* ── Success ─────────────────────────────────────────────── */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="am-success"
            >
              <img src={logoImg} alt="South Point School Guwahati" className="am-success-logo" />
              <h3 className="am-success-title">Application Submitted Successfully!</h3>
              <div className="am-success-divider"></div>
              <p className="am-success-msg">
                Thank you for applying to <strong>South Point School, Guwahati</strong>. 
                Your professional profile has been securely recorded in our talent pool.
              </p>
              <div className="am-success-next-steps">
                <h4>What's Next?</h4>
                <ul>
                  <li>Our recruitment team will review your qualifications against open roles.</li>
                  <li>An confirmation email has been dispatched to your email address.</li>
                  <li>You can track your application status anytime via your dashboard.</li>
                </ul>
              </div>
              <button onClick={onClose} className="am-success-close">Return to Careers</button>
            </motion.div>
          ) : (
            /* ── Form ────────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="am-form-body">

              {/* Personal Information */}
              <div className="am-section">
                <h3 className="am-section-title">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><User size={13} />First Name <span className="am-required">*</span></span>
                    </label>
                    <input className="am-input" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><User size={13} />Last Name <span className="am-required">*</span></span>
                    </label>
                    <input required className="am-input" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div className="am-field-full">
                    <label className="am-label">
                      <span className="am-label-icon"><Mail size={13} />Email Address <span className="am-required">*</span></span>
                    </label>
                    <input className="am-input am-input--readonly" type="email" value={form.email} readOnly />
                  </div>
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><Phone size={13} />Phone Number <span className="am-required">*</span></span>
                    </label>
                    <input required className="am-input" placeholder="10-digit number" value={form.phone} maxLength={10} minLength={10} inputMode="numeric"
                      onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                  </div>
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><MapPin size={13} />Current Location <span className="am-required">*</span></span>
                    </label>
                    <input required className="am-input" placeholder="Guwahati, Assam" value={form.location} onChange={(e) => set("location", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="am-section">
                <h3 className="am-section-title">Professional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><GraduationCap size={13} />Educational Qualification <span className="am-required">*</span></span>
                    </label>
                    <select required className="am-select" value={form.education} onChange={(e) => set("education", e.target.value)}>
                      <option value="">Select education</option>
                      <option>High School / 12th</option><option>Diploma</option><option>Bachelor's Degree</option>
                      <option>Master's Degree</option><option>M.Phil</option><option>PhD / Doctorate</option><option>B.Ed / M.Ed</option>
                    </select>
                  </div>
                  <div>
                    <label className="am-label">Degree Name <span className="am-required">*</span></label>
                    <input required className="am-input" placeholder="e.g. M.Sc Mathematics" value={form.degreeName} onChange={(e) => set("degreeName", e.target.value)} />
                  </div>
                  <div>
                    <label className="am-label">Professional Qualification <span className="am-optional">(Optional)</span></label>
                    <select className="am-select" value={form.professionalQualification} onChange={(e) => set("professionalQualification", e.target.value)}>
                      <option value="">Select qualification</option>
                      <option>B.Ed (Bachelor of Education)</option><option>M.Ed (Master of Education)</option>
                      <option>CTET / STET Certified</option><option>NET / SET Qualified</option>
                      <option>NTT (Nursery Teacher Training)</option><option>D.El.Ed (Diploma in Elementary Education)</option>
                      <option>PG Diploma in Education</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="am-label">Degree Name</label>
                    <input className="am-input" placeholder="e.g. B.Ed, CTET, NET" value={form.professionalQualificationOther} onChange={(e) => set("professionalQualificationOther", e.target.value)} />
                  </div>
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><Briefcase size={13} />Years of Experience <span className="am-required">*</span></span>
                    </label>
                    <select required className="am-select" value={form.experience} onChange={(e) => set("experience", e.target.value)}>
                      <option value="">Select experience</option>
                      <option>0–1 years (Fresher)</option><option>1–3 years</option><option>3–5 years</option><option>5–8 years</option><option>8+ years</option>
                    </select>
                  </div>
                  <div className="sm:col-start-1">
                    <label className="am-label">Extracurricular Qualification <span className="am-optional">(Optional)</span></label>
                    <select className="am-select" value={form.extracurricular} onChange={(e) => set("extracurricular", e.target.value)}>
                      <option value="">Select qualification</option>
                      <option>Sports Coaching</option><option>Music / Performing Arts</option><option>Drama / Theatre</option>
                      <option>Visual Arts / Craft</option><option>Debate / Public Speaking</option><option>Yoga / Physical Education</option>
                      <option>Scouting / NCC</option><option>Community Service / Social Work</option><option>STEM / Robotics Club</option>
                      <option>Environmental Activities</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="am-label">Degree Name</label>
                    <input className="am-input" placeholder="e.g. Sports Coach, Music Diploma" value={form.extracurricularOther} onChange={(e) => set("extracurricularOther", e.target.value)} />
                  </div>
                </div>

                <div className="am-field-mt">
                  <label className="am-label">Roles Interested In <span className="am-required">*</span></label>
                  <SkillsMultiSelect options={ALL_ROLES} selected={selectedRoles} onChange={setSelectedRoles} placeholder="Select one or more roles…" />
                </div>
                <div className="am-field-mt">
                  <label className="am-label">Skills &amp; Strengths <span className="am-required">*</span></label>
                  <SkillsMultiSelect options={ALL_SKILLS} selected={selectedSkills} onChange={setSelectedSkills} placeholder="Select your skills…" />
                </div>

                <div className="am-field-mt grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><Briefcase size={13} />Salary Expectations (₹ per annum) <span className="am-required">*</span></span>
                    </label>
                    <select required className="am-select" value={form.salary} onChange={(e) => set("salary", e.target.value)}>
                      <option value="">Select expected salary</option>
                      <option value="200000">₹2,00,000</option><option value="300000">₹3,00,000</option><option value="400000">₹4,00,000</option>
                      <option value="500000">₹5,00,000</option><option value="600000">₹6,00,000</option><option value="700000">₹7,00,000</option>
                      <option value="800000">₹8,00,000</option><option value="1000000">₹10,00,000</option><option value="1200000">₹12,00,000+</option>
                    </select>
                  </div>
                  <div className="hidden sm:block" />
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><Linkedin size={13} />LinkedIn Profile <span className="am-optional">(Optional)</span></span>
                    </label>
                    <input className="am-input" placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
                  </div>
                  <div>
                    <label className="am-label">
                      <span className="am-label-icon"><LinkIcon size={13} />Portfolio / GitHub / Other <span className="am-optional">(Optional)</span></span>
                    </label>
                    <input className="am-input" placeholder="https://github.com/username" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* CV / Resume */}
              <div className="am-section">
                <h3 className="am-section-title">CV / Resume <span className="am-required">*</span></h3>
                <div className="am-upload-zone" onClick={() => fileRef.current?.click()}>
                  <Upload size={28} />
                  <div className="am-upload-filename">{fileName || "Upload Resume"}</div>
                  <div className="am-upload-hint">PDF, DOC or DOCX • Maximum 5 MB</div>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 5 * 1024 * 1024) { toast.error("File exceeds 5 MB limit."); return; }
                      setFileName(f.name);
                    }
                  }} />
                </div>
              </div>

              {/* Actions */}
              <div className="am-form-footer">
                <button type="button" onClick={onClose} className="am-btn-cancel">Cancel</button>
                <button type="submit" className="am-btn-submit">Submit Application</button>
              </div>

            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
