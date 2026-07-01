import React from "react";
import { Upload, Clock } from "lucide-react";
import { DocumentRow } from "./DocumentRow";
import { AadhaarField, PanField, BankDetailsField } from "./IdentityFields";
import "../../css/sections/onboarding/RequiredDocumentsCard.css";

const COMPULSORY_DOCS = [
  { key: "aadhar", label: "Aadhaar Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Front & back scan — PDF or image" },
  { key: "pan", label: "PAN Card *", accept: ".pdf,.jpg,.jpeg,.png", note: "Required for salary processing" },
  { key: "bank_details", label: "Bank Details *", accept: ".pdf,.jpg,.jpeg,.png", note: "Passbook or cancelled cheque" },
  { key: "photo", label: "Passport Size Photo *", accept: ".jpg,.jpeg,.png", note: "White background, recent photo" },
];

const OPTIONAL_DOCS = [
  { key: "driving_license", label: "Driving License", accept: ".pdf,.jpg,.jpeg,.png", note: "Valid driving license (Optional)" },
  { key: "class10", label: "Class 10 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
  { key: "class12", label: "Class 12 Marksheet", accept: ".pdf,.jpg,.jpeg,.png", note: "Board certificate or marksheet (Optional)" },
  { key: "degree", label: "Degree / Graduation Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Final degree or provisional certificate (Optional)" },
  { key: "experience_cert", label: "Experience Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "From previous employer (Optional)" },
  { key: "prof_cert", label: "Professional Certificate", accept: ".pdf,.jpg,.jpeg,.png", note: "Any relevant professional certificate (Optional)" },
];

export function RequiredDocumentsCard({
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  docStatus = {},
  docsSubmitted,
  startDocCamera,
  handleSubmitDocs,
  aadharNumber,
  setAadharNumber,
  panNumber,
  setPanNumber,
  pfNumber,
  setPfNumber,
  esiNumber,
  setEsiNumber,
  bankAccount,
  setBankAccount,
  bankIfsc,
  setBankIfsc,
  bankName,
  setBankName,
  bankHolder,
  setBankHolder,
}) {
  const rowProps = { docs, setDocs, docUrls, setDocUrls, docStatus, docsSubmitted, startDocCamera };

  const extraFor = (key) => {
    if (key === "aadhar") {
      return (
        <AadhaarField
          aadharNumber={aadharNumber}
          setAadharNumber={setAadharNumber}
          docsSubmitted={docsSubmitted}
        />
      );
    }
    if (key === "pan") {
      return (
        <PanField panNumber={panNumber} setPanNumber={setPanNumber} docsSubmitted={docsSubmitted} />
      );
    }
    if (key === "bank_details") {
      return (
        <BankDetailsField
          bankHolder={bankHolder}
          setBankHolder={setBankHolder}
          bankAccount={bankAccount}
          setBankAccount={setBankAccount}
          bankIfsc={bankIfsc}
          setBankIfsc={setBankIfsc}
          bankName={bankName}
          setBankName={setBankName}
          docsSubmitted={docsSubmitted}
        />
      );
    }
    return null;
  };

  return (
    <div className="rd-card">
      <div className="rd-header">
        <Upload size={16} />
        <h2 className="rd-title">Required Documents</h2>
      </div>

      <div className="rd-body">
        <h3 className="rd-section-title">
          Compulsory Details
        </h3>
        <div className="rd-list rd-list--margin">
          {COMPULSORY_DOCS.map((doc) => (
            <DocumentRow key={doc.key} docKey={doc.key} label={doc.label} accept={doc.accept} note={doc.note} {...rowProps}>
              {extraFor(doc.key)}
            </DocumentRow>
          ))}
        </div>

        <h3 className="rd-section-title">
          Optional Details
        </h3>
        <div className="rd-list">
          <div className="rd-optional-fields-box">
            <div>
              <label className="rd-field-label">
                PF Number
              </label>
              <input
                type="text"
                value={pfNumber}
                disabled={docsSubmitted}
                onChange={(e) => setPfNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter PF Number"
                className="rd-field-input"
              />
            </div>
            <div>
              <label className="rd-field-label">
                ESI Number
              </label>
              <input
                type="text"
                value={esiNumber}
                disabled={docsSubmitted}
                onChange={(e) => setEsiNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter ESI Number"
                className="rd-field-input"
              />
            </div>
          </div>
          {OPTIONAL_DOCS.map((doc) => (
            <DocumentRow key={doc.key} docKey={doc.key} label={doc.label} accept={doc.accept} note={doc.note} {...rowProps} />
          ))}
        </div>

        {/* Document Submit Bottom Status / Action */}
        {docsSubmitted ? (
          <div className="rd-banner--review">
            <Clock size={20} color="#b45309" className="rd-banner-icon" />
            <div>
              <div className="rd-banner-title--review">
                Documents Under Review
              </div>
              <div className="rd-banner-text">
                Your documents have been submitted and are currently under review by HR.
              </div>
            </div>
          </div>
        ) : (
          <div className="rd-footer">
            <button
              onClick={handleSubmitDocs}
              className="rd-btn-submit"
            >
              Submit Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
