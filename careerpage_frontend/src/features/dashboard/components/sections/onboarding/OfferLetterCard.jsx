import React from "react";
import { PartyPopper, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import { offerLetter } from "../../../../../mockData/dashboardMockData";
import "../../css/sections/onboarding/OfferLetterCard.css";

export function OfferLetterCard({
  offerAccepted,
  setOfferAccepted,
  offerRejected,
  setOfferRejected,
  showOfferConfirm,
  setShowOfferConfirm,
}) {
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
                Welcome to South Point School. Joining date: <strong>{offerLetter.joiningDate}</strong>
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
              { label: "Position", value: offerLetter.role },
              { label: "Department", value: offerLetter.department },
              { label: "Joining Date", value: offerLetter.joiningDate },
              { label: "Offered CTC", value: offerLetter.salary },
              { label: "Issued On", value: offerLetter.issuedDate },
              { label: "Offer Expires", value: offerLetter.expiryDate },
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
            onClick={() => window.open("#", "_blank")}
          >
            <Eye size={14} /> View Letter
          </button>

          {!offerRejected && (
            <button
              className="ol-btn-secondary"
              onClick={() => window.open("#", "_blank")}
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
              Confirm acceptance of the offer for <strong>{offerLetter.role}</strong>?
            </div>
            <div className="ol-confirm-actions">
              <button
                onClick={() => {
                  setOfferAccepted(true);
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
              Are you sure you want to decline the offer for <strong>{offerLetter.role}</strong>? This cannot be undone.
            </div>
            <div className="ol-confirm-actions">
              <button
                onClick={() => {
                  setOfferRejected(true);
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
    </div>
  );
}
