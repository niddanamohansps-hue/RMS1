import React, { useState } from "react";
import { PartyPopper, CheckCircle, XCircle, Eye, Download, X } from "lucide-react";
import { offerLetter } from "../../../../../mockData/dashboardMockData";
import "../../css/sections/onboarding/OfferLetterCard.css";

import { toast } from "sonner";

export function OfferLetterCard({
  offerAccepted,
  setOfferAccepted,
  offerRejected,
  setOfferRejected,
  showOfferConfirm,
  setShowOfferConfirm,
  candidateOffer = null,
  onAccept,
  onDecline,
}) {
  const displayOffer = candidateOffer ? {
    role: candidateOffer.role,
    department: candidateOffer.department,
    joiningDate: candidateOffer.joiningDate || "—",
    salary: candidateOffer.salary || "—",
    issuedDate: candidateOffer.issuedDate || "—",
    expiryDate: candidateOffer.expiryDate || "—",
  } : offerLetter;

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const candidateName = candidateOffer?.candidateName || "Candidate";

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Offer Letter - South Point School</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #72102a; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #72102a; }
            .sub { font-size: 14px; text-transform: uppercase; color: #666; margin-top: 5px; letter-spacing: 0.05em; }
            .content { font-size: 16px; }
            .signature { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">South Point School</div>
            <div class="sub">Offer of Employment</div>
          </div>
          <div class="content">
            <p>Dear <strong>${candidateName}</strong>,</p>
            <p>We are pleased to offer you the position of <strong>${displayOffer.role}</strong> at South Point School. The monthly compensation for this role is <strong>${displayOffer.salary}</strong>.</p>
            <p>This offer is valid until <strong>${displayOffer.expiryDate}</strong>. Please confirm your acceptance by the deadline.</p>
            <div class="signature">
              Warm regards,<br/>
              <strong>HR Department</strong><br/>
              <span>South Point School</span>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="ol-card">
      <div className="ol-header">
        <PartyPopper size={16} />
        <h2 className="ol-title">Offer Letter</h2>
      </div>

      <div className="ol-body">
        {/* Status Banners */}
        {offerAccepted && (
          <div className="ol-banner--accepted">
            <CheckCircle size={20} color="#065f46" className="ol-banner-icon" />
            <div>
              <div className="ol-banner-title--accepted">
                Offer Accepted!
              </div>
              <div className="ol-banner-text">
                Welcome to South Point School. Joining date: <strong>{displayOffer.joiningDate}</strong>
              </div>
            </div>
          </div>
        )}

        {offerRejected && (
          <div className="ol-banner--declined">
            <XCircle size={20} color="#991b1b" className="ol-banner-icon" />
            <div>
              <div className="ol-banner-title--declined">
                Offer Declined
              </div>
              <div className="ol-banner-text">
                You have declined the offer. Contact HR if this was a mistake.
              </div>
            </div>
          </div>
        )}

        {/* Offer Details Grid */}
        <div className="ol-details-box">
          <div className="ol-details-title">
            Offer Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
            {[
              { label: "Position", value: displayOffer.role },
              { label: "Department", value: displayOffer.department },
              { label: "Joining Date", value: displayOffer.joiningDate },
              { label: "Offered CTC", value: displayOffer.salary },
              { label: "Issued On", value: displayOffer.issuedDate },
              { label: "Offer Expires", value: displayOffer.expiryDate },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="ol-details-label">
                  {label}
                </div>
                <div
                  className={`ol-details-val ${
                    label === "Offer Expires" ? "ol-details-val--expires" : ""
                  }`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ol-actions">
          <button
            className="ol-btn-secondary"
            onClick={() => setShowPreviewModal(true)}
          >
            <Eye size={14} /> View Letter
          </button>

          {!offerRejected && (
            <button
              className="ol-btn-secondary"
              onClick={handleDownloadPDF}
            >
              <Download size={14} /> Download PDF
            </button>
          )}

          {!offerAccepted && !offerRejected && (
            <>
              <button
                onClick={() => setShowOfferConfirm("accept")}
                className="ol-btn-accept"
              >
                <CheckCircle size={14} /> Accept Offer
              </button>
              <button
                onClick={() => setShowOfferConfirm("reject")}
                className="ol-btn-decline"
              >
                <XCircle size={14} /> Decline Offer
              </button>
            </>
          )}
        </div>

        {/* Accept / Decline Confirm Boxes */}
        {showOfferConfirm === "accept" && (
          <div className="ol-confirm--accept">
            <div className="ol-confirm-title--accept">
              Confirm acceptance of the offer for <strong>{displayOffer.role}</strong>?
            </div>
            <div className="ol-confirm-actions">
              <button
                onClick={() => {
                  if (onAccept) onAccept();
                  setShowOfferConfirm(null);
                }}
                className="ol-confirm-btn--accept"
              >
                Yes, Accept
              </button>
              <button
                onClick={() => setShowOfferConfirm(null)}
                className="ol-confirm-btn--cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showOfferConfirm === "reject" && (
          <div className="ol-confirm--reject">
            <div className="ol-confirm-title--reject">
              Are you sure you want to decline the offer for <strong>{displayOffer.role}</strong>? This cannot be undone.
            </div>
            <div className="ol-confirm-actions">
              <button
                onClick={() => {
                  if (onDecline) onDecline();
                  setShowOfferConfirm(null);
                }}
                className="ol-confirm-btn--reject"
              >
                Yes, Decline
              </button>
              <button
                onClick={() => setShowOfferConfirm(null)}
                className="ol-confirm-btn--cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {showPreviewModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", color: "#333", borderRadius: 16, maxWidth: 500, width: "calc(100% - 32px)", padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.2)", position: "relative" }}>
            <button onClick={() => setShowPreviewModal(false)} style={{ position: "absolute", top: 16, right: 16, border: "none", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280", padding: 4 }}>
              <X size={20} />
            </button>
            <div style={{ textAlign: "center", marginBottom: 20, borderBottom: "1.5px dashed #e5e7eb", paddingBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#72102a" }}>South Point School</div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Offer of Employment</div>
            </div>
            <div style={{ fontSize: 14.5, color: "#374151", lineHeight: 1.8 }}>
              <p style={{ marginTop: 0 }}>Dear <strong>{candidateName}</strong>,</p>
              <p>We are pleased to offer you the position of <strong>{displayOffer.role}</strong> at South Point School. The monthly compensation for this role is <strong style={{ color: "#00796B" }}>{displayOffer.salary}</strong>.</p>
              <p>This offer is valid until <strong>{displayOffer.expiryDate}</strong>. Please confirm your acceptance by the deadline.</p>
              <p style={{ marginTop: 24, marginBottom: 0, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>Warm regards,<br /><strong>HR Department</strong><br /><span style={{ fontSize: 12, color: "#9ca3af" }}>South Point School</span></p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={handleDownloadPDF} style={{ border: "none", background: "#72102a", color: "#fff", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 700 }}>Print / Save PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
