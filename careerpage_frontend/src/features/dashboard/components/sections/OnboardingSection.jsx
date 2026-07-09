import React from "react";
import { motion } from "motion/react";
import { OfferLetterCard } from "./onboarding/OfferLetterCard";
import { RequiredDocumentsCard } from "./onboarding/RequiredDocumentsCard";
import { OnboardingProgress } from "./onboarding/OnboardingProgress";
import "../css/sections/OnboardingSection.css";

export function OnboardingSection({
  offerAccepted,
  setOfferAccepted,
  offerRejected,
  setOfferRejected,
  showOfferConfirm,
  setShowOfferConfirm,
  candidateOffer = null,
  onAccept,
  onDecline,
  docs,
  setDocs,
  docUrls,
  setDocUrls,
  docStatus = {},
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
  docsSubmitted,
  startDocCamera,
  handleSubmitDocs,
}) {
  const onboarding = candidateOffer?.onboarding || {};
  const steps = [
    { label: "Profile Submitted", done: !!onboarding.task_profile, desc: "Your basic profile has been received." },
    { label: "Offer Letter Accepted", done: !!onboarding.task_offer || offerAccepted, desc: "Accept your offer letter to proceed." },
    { label: "Documentation Upload", done: !!onboarding.task_docs_upload || docsSubmitted, desc: "Upload all required documents after accepting the offer." },
    { label: "Document Verification", done: !!onboarding.task_docs_verify, desc: "HR will verify your submitted documents." },
    { label: "Background Check", done: !!onboarding.task_bgc, desc: "HR will initiate a background verification." },
    { label: "Joining Confirmation", done: !!onboarding.task_checkin, desc: "You will receive a final confirmation email." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="ob-page-title">
        Onboarding
      </h1>
      <p className="ob-page-sub">
        Submit required documents and complete your onboarding process.
      </p>

      {candidateOffer ? (
        <OfferLetterCard
          offerAccepted={offerAccepted}
          setOfferAccepted={setOfferAccepted}
          offerRejected={offerRejected}
          setOfferRejected={setOfferRejected}
          showOfferConfirm={showOfferConfirm}
          setShowOfferConfirm={setShowOfferConfirm}
          candidateOffer={candidateOffer}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", color: "#6b7280", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 12, display: "inline-block" }}>🎉</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>No Active Offers</h3>
          <p style={{ fontSize: 13, marginTop: 4, maxWidth: 360, margin: "4px auto 0" }}>You do not have any active offer letters at the moment. We will notify you once HR issues an offer.</p>
        </div>
      )}

      {/* Required Documents Checklist - visible after acceptance */}
      {offerAccepted && (
        <RequiredDocumentsCard
          docs={docs}
          setDocs={setDocs}
          docUrls={docUrls}
          setDocUrls={setDocUrls}
          docStatus={docStatus}
          docsSubmitted={docsSubmitted}
          startDocCamera={startDocCamera}
          handleSubmitDocs={handleSubmitDocs}
          aadharNumber={aadharNumber}
          setAadharNumber={setAadharNumber}
          panNumber={panNumber}
          setPanNumber={setPanNumber}
          pfNumber={pfNumber}
          setPfNumber={setPfNumber}
          esiNumber={esiNumber}
          setEsiNumber={setEsiNumber}
          bankAccount={bankAccount}
          setBankAccount={setBankAccount}
          bankIfsc={bankIfsc}
          setBankIfsc={setBankIfsc}
          bankName={bankName}
          setBankName={setBankName}
          bankHolder={bankHolder}
          setBankHolder={setBankHolder}
        />
      )}

      <OnboardingProgress steps={steps} />
    </motion.div>
  );
}
