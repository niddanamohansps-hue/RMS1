import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { capitalizeWords } from "../../../../../mockData/dashboardMockData";
import "../../css/sections/profile/PersonalInfoCard.css";

export function PersonalInfoCard({ profile, setProfile, sectionRef }) {
  // Email OTP edit flow states
  const [emailEdit, setEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const handleSendOtp = () => {
    if (newEmail) {
      setOtpSent(true);
      setOtpError("");
    }
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.length > 0) {
      setProfile((prev) => ({ ...prev, email: newEmail }));
      setEmailVerified(true);
      setEmailEdit(false);
      setOtpError("");
    } else {
      setOtpError("Please enter the OTP.");
    }
  };

  return (
    <div
      ref={sectionRef}
      className="pic-card"
    >
      <h2 className="pic-title">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        {/* First Name */}
        <div>
          <label className="pic-field-label">
            First Name
          </label>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: capitalizeWords(e.target.value) })}
            placeholder="First name"
            className="pic-input"
          />
        </div>
        {/* Last Name */}
        <div>
          <label className="pic-field-label">
            Last Name
          </label>
          <input
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: capitalizeWords(e.target.value) })}
            placeholder="Last name"
            className="pic-input"
          />
        </div>

        {/* Email with OTP change flow */}
        <div className="pic-email-col">
          <label className="pic-field-label">
            Email Address
          </label>
          {!emailEdit ? (
            <div className="pic-email-display-row">
              <input
                value={profile.email}
                readOnly
                className="pic-input"
              />
              <button
                onClick={() => {
                  setEmailEdit(true);
                  setNewEmail("");
                  setOtpSent(false);
                  setEnteredOtp("");
                  setOtpError("");
                  setEmailVerified(false);
                }}
                className="pic-btn-primary"
              >
                Change Email
              </button>
            </div>
          ) : emailVerified ? (
            <div className="pic-banner-success">
              <CheckCircle size={16} color="#065f46" />
              <span className="pic-banner-success-text">
                Email updated to {profile.email}
              </span>
            </div>
          ) : (
            <div className="pic-email-edit-col">
              <div className="pic-email-input-row">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="pic-input"
                />
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    className="pic-btn-primary"
                  >
                    Send OTP
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setEnteredOtp("");
                      setOtpError("");
                    }}
                    className="pic-btn-secondary"
                  >
                    Resend
                  </button>
                )}
              </div>
              {otpSent && (
                <>
                  <div className="pic-banner-info">
                    OTP sent to <strong>{newEmail}</strong>. Enter the OTP you received.
                  </div>
                  <div className="pic-email-input-row">
                    <input
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      inputMode="numeric"
                      className={`pic-input pic-input--otp ${
                        otpError ? "pic-input--otp-error" : ""
                      }`}
                    />
                    <button
                      onClick={handleVerifyOtp}
                      className="pic-btn-verify"
                    >
                      Verify OTP
                    </button>
                  </div>
                  {otpError && <div className="pic-error-msg">{otpError}</div>}
                </>
              )}
              <button
                onClick={() => {
                  setEmailEdit(false);
                  setOtpSent(false);
                  setEnteredOtp("");
                  setOtpError("");
                }}
                className="pic-btn-cancel"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="pic-field-label">
            Phone Number
          </label>
          <input
            value={profile.phone}
            inputMode="numeric"
            maxLength={10}
            minLength={10}
            pattern="\d{10}"
            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            placeholder="Enter a number"
            className="pic-input"
          />
        </div>

        {/* Location */}
        <div>
          <label className="pic-field-label">
            Current Location
          </label>
          <input
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            placeholder="Guwahati, Assam"
            className="pic-input"
          />
        </div>
      </div>
    </div>
  );
}
