import React from "react";
import { SkillsMultiSelect } from "./SkillsMultiSelect";
import { ALL_ROLES, ALL_SKILLS } from "../../../../../mockData/dashboardMockData";
import "../../css/sections/profile/ProfessionalInfoCard.css";

export function ProfessionalInfoCard({ profile, setProfile, sectionRef }) {
  return (
    <div
      ref={sectionRef}
      className="pr-card"
    >
      <h2 className="pr-title">
        Professional Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        {/* Educational Qualification */}
        <div>
          <label className="pr-field-label">
            Educational Qualification <span className="pr-required-star">*</span>
          </label>
          <select
            value={profile.highestEducation}
            onChange={(e) => setProfile({ ...profile, highestEducation: e.target.value })}
            className="pr-input"
          >
            <option value="">Select education</option>
            <option>High School / 12th</option>
            <option>Diploma</option>
            <option>Bachelor's Degree</option>
            <option>Master's Degree</option>
            <option>M.Phil</option>
            <option>PhD / Doctorate</option>
            <option>B.Ed / M.Ed</option>
          </select>
        </div>

        {/* Degree Name */}
        <div>
          <label className="pr-field-label">
            Degree Name
          </label>
          <input
            value={profile.degreeName}
            onChange={(e) => setProfile({ ...profile, degreeName: e.target.value })}
            placeholder="e.g. M.Sc Mathematics"
            className="pr-input"
          />
        </div>

        {/* Professional Qualification */}
        <div>
          <label className="pr-field-label">
            Professional Qualification <span className="pr-optional-label">(Optional)</span>
          </label>
          <select
            value={profile.professionalQualification}
            onChange={(e) => setProfile({ ...profile, professionalQualification: e.target.value })}
            className="pr-input"
          >
            <option value="">Select qualification</option>
            <option>B.Ed (Bachelor of Education)</option>
            <option>M.Ed (Master of Education)</option>
            <option>CTET / STET Certified</option>
            <option>NET / SET Qualified</option>
            <option>NTT (Nursery Teacher Training)</option>
            <option>D.El.Ed (Diploma in Elementary Education)</option>
            <option>PG Diploma in Education</option>
            <option>Other</option>
          </select>
        </div>

        {/* Other Professional Qualification Text */}
        <div>
          <label className="pr-field-label">
            Detail (if 'Other')
          </label>
          <input
            value={profile.professionalQualificationOther}
            onChange={(e) => setProfile({ ...profile, professionalQualificationOther: e.target.value })}
            placeholder="e.g. B.Ed, CTET, NET"
            className="pr-input"
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="pr-field-label">
            Years of Experience
          </label>
          <select
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
            className="pr-input"
          >
            <option value="">Select experience</option>
            <option>0–1 years (Fresher)</option>
            <option>1–3 years</option>
            <option>3–5 years</option>
            <option>5–8 years</option>
            <option>8+ years</option>
          </select>
        </div>

        {/* Extracurricular Qualification */}
        <div className="sm:col-start-1">
          <label className="pr-field-label">
            Extracurricular Qualification <span className="pr-optional-label">(Optional)</span>
          </label>
          <select
            value={profile.extracurricular}
            onChange={(e) => setProfile({ ...profile, extracurricular: e.target.value })}
            className="pr-input"
          >
            <option value="">Select qualification</option>
            <option>Sports Coaching</option>
            <option>Music / Performing Arts</option>
            <option>Drama / Theatre</option>
            <option>Visual Arts / Craft</option>
            <option>Debate / Public Speaking</option>
            <option>Yoga / Physical Education</option>
            <option>Scouting / NCC</option>
            <option>Community Service / Social Work</option>
            <option>STEM / Robotics Club</option>
            <option>Environmental Activities</option>
            <option>Other</option>
          </select>
        </div>

        {/* Other Extracurricular Detail */}
        <div>
          <label className="pr-field-label">
            Detail (if 'Other')
          </label>
          <input
            value={profile.extracurricularOther}
            onChange={(e) => setProfile({ ...profile, extracurricularOther: e.target.value })}
            placeholder="e.g. Sports Coach, Music Diploma"
            className="pr-input"
          />
        </div>
      </div>

      {/* Roles Interested In */}
      <div className="pr-group-margin">
        <label className="pr-field-label">
          Roles Interested In
        </label>
        <SkillsMultiSelect
          options={ALL_ROLES}
          selected={profile.roles}
          onChange={(v) => setProfile({ ...profile, roles: v })}
          placeholder="Select or add roles interested in…"
        />
      </div>

      {/* Skills & Strengths */}
      <div className="pr-group-margin">
        <label className="pr-field-label">
          Skills & Strengths
        </label>
        <SkillsMultiSelect
          options={ALL_SKILLS}
          selected={profile.skills}
          onChange={(v) => setProfile({ ...profile, skills: v })}
          placeholder="Select or add skills…"
        />
      </div>

      {/* Salary Expectations + LinkedIn + Portfolio */}
      <div className="pr-group-margin grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        <div>
          <label className="pr-field-label">
            Salary Expectations (₹ per annum)
          </label>
          <select
            value={profile.salary}
            onChange={(e) => setProfile({ ...profile, salary: e.target.value })}
            className="pr-input"
          >
            <option value="">Select expected salary</option>
            <option value="200000">₹2,00,000</option>
            <option value="300000">₹3,00,000</option>
            <option value="400000">₹4,00,000</option>
            <option value="500000">₹5,00,000</option>
            <option value="600000">₹6,00,000</option>
            <option value="700000">₹7,00,000</option>
            <option value="800000">₹8,00,000</option>
            <option value="1000000">₹10,00,000</option>
            <option value="1200000">₹12,00,000+</option>
          </select>
        </div>
        <div className="hidden sm:block" />
        <div>
          <label className="pr-field-label">
            LinkedIn Profile <span className="pr-optional-label">(Optional)</span>
          </label>
          <input
            value={profile.linkedin}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/yourname"
            className="pr-input"
          />
        </div>
        <div>
          <label className="pr-field-label">
            Portfolio / GitHub / Other <span className="pr-optional-label">(Optional)</span>
          </label>
          <input
            value={profile.portfolio}
            onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
            placeholder="https://github.com/username"
            className="pr-input"
          />
        </div>
      </div>
    </div>
  );
}
