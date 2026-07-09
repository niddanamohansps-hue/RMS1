import { useState, useRef, useEffect } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint, useHorizontalScroll } from "../hooks";
import { api } from "../lib/api";
import { Card, SectionTitle, Mono, Badge, Btn, Modal, ModalHeader } from "../components/ui";

const TASK_KEYS = ["profile", "offer", "docsUpload", "docsVerify", "bgc", "checkin"];
const TASK_LABELS = [
  "Profile Submitted",
  "Offer Letter Accepted",
  "Documentation Upload",
  "Document Verification",
  "Background Check",
  "Check In"
];

export default function Onboarding({ jobPostings = [], offers = [], jobApplications = [], generalApplications = [] }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const hScroll = useHorizontalScroll();
  const accentColor = T.blue;
  const accentPale = T.bluePale;

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filterActiveIndex, setFilterActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const [selectedPostingId, setSelectedPostingId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOnboardingRecords = async () => {
    setLoading(true);
    try {
      const data = await api.get("/onboarding/");
      const list = data.results ? data.results : data;
      const mapped = list.map((onb) => {
        const tasks = {
          profile: "Verified",
          offer: "Verified",
          docsUpload: onb.task_docs_upload ? "Verified" : "Pending",
          docsVerify: onb.task_docs_verify ? "Verified" : "Pending",
          bgc: onb.task_bgc ? "Verified" : "Pending",
          checkin: onb.task_checkin,
        };

        return {
          id: onb.record_id,
          db_id: onb.id,
          name: onb.employee_name,
          role: onb.role,
          joining: onb.joining_date || "—",
          empId: onb.employee_id || "—",
          status: onb.status || "Documents Pending",
          tasks: tasks,
          aadhar_number: onb.aadhar_number,
          aadhar_card: onb.aadhar_card,
          pan_number: onb.pan_number,
          pan_card: onb.pan_card,
          bank_holder_name: onb.bank_holder_name,
          bank_account_number: onb.bank_account_number,
          bank_ifsc: onb.bank_ifsc,
          bank_name: onb.bank_name,
          bank_passbook: onb.bank_passbook,
          passport_photo: onb.passport_photo,
          pf_number: onb.pf_number,
          esi_number: onb.esi_number,
          driving_license: onb.driving_license,
          class10_marksheet: onb.class10_marksheet,
          class12_marksheet: onb.class12_marksheet,
          degree_certificate: onb.degree_certificate,
          experience_certificate: onb.experience_certificate,
          professional_certificate: onb.professional_certificate,
          verified_docs: onb.verified_docs || "[]",
          rejected_docs: onb.rejected_docs || "[]",
        };
      });
      setRecords(mapped);
    } catch (err) {
      console.error("Failed to fetch onboarding records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDocVerification = (record, docKey, status) => {
    setRecords((prev) => {
      const currentRecordState = prev.find(r => r.db_id === record.db_id);
      if (!currentRecordState) return prev;

      let verified = [];
      let rejected = [];
      try {
        verified = JSON.parse(currentRecordState.verified_docs || "[]");
      } catch {}
      try {
        rejected = JSON.parse(currentRecordState.rejected_docs || "[]");
      } catch {}

      if (status === "Verified") {
        if (!verified.includes(docKey)) verified.push(docKey);
        rejected = rejected.filter(k => k !== docKey);
      } else if (status === "Rejected") {
        if (!rejected.includes(docKey)) rejected.push(docKey);
        verified = verified.filter(k => k !== docKey);
      }

      const payload = {
        verified_docs: JSON.stringify(verified),
        rejected_docs: JSON.stringify(rejected),
      };

      api.patch(`/onboarding/${record.db_id}/`, payload).catch((err) => {
        alert("Failed to update document verification check: " + err.message);
        fetchOnboardingRecords();
      });

      return prev.map((r) => {
        if (r.db_id !== record.db_id) return r;
        return {
          ...r,
          verified_docs: payload.verified_docs,
          rejected_docs: payload.rejected_docs,
        };
      });
    });
  };

  const areAllDocsVerified = (record) => {
    if (!record) return false;
    const docKeys = [
      { key: "aadhar", file: record.aadhar_card },
      { key: "pan", file: record.pan_card },
      { key: "bank_details", file: record.bank_passbook },
      { key: "photo", file: record.passport_photo },
      { key: "driving_license", file: record.driving_license },
      { key: "class10", file: record.class10_marksheet },
      { key: "class12", file: record.class12_marksheet },
      { key: "degree", file: record.degree_certificate },
      { key: "experience_cert", file: record.experience_certificate },
      { key: "prof_cert", file: record.professional_certificate },
    ].filter(item => item.file).map(item => item.key);

    if (docKeys.length === 0) return false;

    let verifiedList = [];
    try {
      verifiedList = JSON.parse(record.verified_docs || "[]");
    } catch {}

    return docKeys.every(k => verifiedList.includes(k));
  };

  useEffect(() => {
    fetchOnboardingRecords();
  }, [offers]);

  const ALL_APPS = [...jobApplications, ...generalApplications.map((a) => ({ ...a, role: a.preferredRole }))];

  const getCandidateDetails = (name) => {
    const app = ALL_APPS.find((a) => a.name && a.name.toLowerCase() === name.toLowerCase());
    const offer = offers.find((o) => o.candidate && o.candidate.toLowerCase() === name.toLowerCase());
    return {
      email: app?.email || "—",
      phone: app?.phone || "—",
      referredBy: app?.referredBy || "None",
      resume: app?.resume || "",
      ctc: offer?.ctc || "—",
      education: app?.qualification || "—",
      experience: app?.experience || "—",
    };
  };

  const isTaskDone = (key, val) => {
    if (key === "checkin") return !!val;
    return val === "Verified";
  };

  const toggleTask = async (id, taskKey) => {
    const record = records.find(r => r.id === id);
    if (!record || !record.db_id) return;

    const nextVal = !record.tasks[taskKey];
    const backendKeyMap = {
      profile: "task_profile",
      offer: "task_offer",
      docsUpload: "task_docs_upload",
      docsVerify: "task_docs_verify",
      bgc: "task_bgc",
      checkin: "task_checkin",
    };
    const backendKey = backendKeyMap[taskKey];
    if (!backendKey) return;

    try {
      await api.patch(`/onboarding/${record.db_id}/tasks/`, { [backendKey]: nextVal });
      setRecords((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const updatedTasks = { ...r.tasks, [taskKey]: nextVal };
          const done = TASK_KEYS.filter((k) => isTaskDone(k, updatedTasks[k])).length;
          const newStatus = done === TASK_KEYS.length ? "Completed" : done === 0 ? "Initiated" : "Documents Pending";
          return { ...r, tasks: updatedTasks, status: newStatus };
        }),
      );
    } catch (err) {
      alert("Failed to update task: " + err.message);
    }
  };

  const setTaskStatus = async (id, taskKey, newStatus) => {
    const record = records.find(r => r.id === id);
    if (!record || !record.db_id) return;

    const nextVal = newStatus === "Verified";
    const backendKeyMap = {
      profile: "task_profile",
      offer: "task_offer",
      docsUpload: "task_docs_upload",
      docsVerify: "task_docs_verify",
      bgc: "task_bgc",
      checkin: "task_checkin",
    };
    const backendKey = backendKeyMap[taskKey];
    if (!backendKey) return;

    try {
      await api.patch(`/onboarding/${record.db_id}/tasks/`, { [backendKey]: nextVal });
      setRecords((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const updatedTasks = { ...r.tasks, [taskKey]: newStatus };
          const done = TASK_KEYS.filter((k) => isTaskDone(k, updatedTasks[k])).length;
          const newStatusStr = done === TASK_KEYS.length ? "Completed" : done === 0 ? "Initiated" : "Documents Pending";
          return { ...r, tasks: updatedTasks, status: newStatusStr };
        }),
      );
    } catch (err) {
      alert("Failed to update verification check: " + err.message);
    }
  };

  const enrichedPostings = jobPostings.map((p) => ({
    ...p,
    onboardCount: records.filter((r) => r.role === p.role).length,
  }));

  const selectedRole = enrichedPostings.find((p) => p.id === selectedPostingId)?.role ?? null;

  const filteredRecords = selectedPostingId
    ? records.filter((r) => r.role === selectedRole)
    : records;

  const scrollCarousel = (dir) => {
    hScroll.ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const selectPosting = (id) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
  };

  const currentRecord = selectedRecord ? records.find(r => r.id === selectedRecord.id) : null;

  const getTaskIconAndColor = (key, val) => {
    if (key === "checkin") {
      return val
        ? { icon: "✓", color: T.green, bg: T.greenLight, border: "#A7F3D0" }
        : { icon: "○", color: T.inkFaint, bg: T.canvas, border: T.border };
    }
    if (val === "Verified") return { icon: "✓", color: T.green, bg: T.greenLight, border: "#A7F3D0" };
    if (val === "Rejected") return { icon: "✗", color: T.red, bg: T.redLight, border: "#FECACA" };
    return { icon: "○", color: T.inkFaint, bg: T.canvas, border: T.border };
  };

  const renderProfilePreview = (record, details) => (
    <div style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.6 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.blue }}>{record.name}</div>
        <div style={{ fontSize: 11, color: T.inkLight }}>{record.role} Candidate Profile</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><strong>Email:</strong> {details.email}</div>
        <div><strong>Phone:</strong> {details.phone}</div>
        <div><strong>CTC Offered:</strong> {details.ctc}</div>
        <div><strong>Referred By:</strong> {details.referredBy}</div>
      </div>
      <div style={{ marginTop: 12 }}><strong>Education:</strong> {details.education}</div>
      <div style={{ marginTop: 6 }}><strong>Experience:</strong> {details.experience}</div>
    </div>
  );

  const renderOfferPreview = (record, details) => (
    <div style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.6 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.green }}>Offer Status: Accepted</div>
        <div style={{ fontSize: 11, color: T.inkLight }}>Digitally Signed by {record.name}</div>
      </div>
      <div style={{ background: T.canvas, padding: 14, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <p>Dear {record.name},</p>
        <p>We are pleased to offer you the role of <strong>{record.role}</strong> at South Point School.</p>
        <p>Compensation: <strong>{details.ctc}</strong></p>
        <p>Joining Date: <strong>{record.joining}</strong></p>
      </div>
    </div>
  );

  const renderDocsUploadPreview = (record) => {
    const docList = [
      { label: "Aadhaar Card", file: record.aadhar_card, extra: `Aadhaar Number: ${record.aadhar_number || "—"}` },
      { label: "PAN Card", file: record.pan_card, extra: `PAN Number: ${record.pan_number || "—"}` },
      { label: "Bank Passbook / Cheque", file: record.bank_passbook, extra: `Bank: ${record.bank_name || "—"} | A/C: ${record.bank_account_number || "—"} | IFSC: ${record.bank_ifsc || "—"} | Holder: ${record.bank_holder_name || "—"}` },
      { label: "Passport Photo", file: record.passport_photo },
      { label: "Driving License", file: record.driving_license },
      { label: "Class 10 Marksheet", file: record.class10_marksheet },
      { label: "Class 12 Marksheet", file: record.class12_marksheet },
      { label: "Degree Certificate", file: record.degree_certificate },
      { label: "Experience Certificate", file: record.experience_certificate },
      { label: "Professional Certificate", file: record.professional_certificate },
    ].filter(item => item.file);

    const textDetails = [
      { label: "PF Number", value: record.pf_number },
      { label: "ESI Number", value: record.esi_number },
    ].filter(item => item.value);

    const getFilename = (url) => {
      if (!url) return "";
      return url.split("/").pop();
    };

    const getFullUrl = (url) => {
      if (!url) return "";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      const hostname = window.location.hostname;
      const port = 8000;
      return `http://${hostname}:${port}${url}`;
    };

    return (
      <div style={{ fontSize: 13, color: T.inkMid }}>
        {textDetails.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 11, color: T.inkLight, textTransform: "uppercase" }}>Identity Numbers:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {textDetails.map(item => (
                <div key={item.label}>
                  <strong>{item.label}:</strong> {item.value}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 10 }}><strong>Uploaded Files & Credentials:</strong></div>
        {docList.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", color: T.inkFaint }}>No documents uploaded yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {docList.map((doc) => (
              <div key={doc.label} style={{ display: "flex", flexDirection: "column", padding: "10px 14px", background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}`, gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.ink }}>{doc.label}</div>
                    <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{getFilename(doc.file)}</div>
                  </div>
                  <button
                    onClick={() => window.open(getFullUrl(doc.file), "_blank")}
                    style={{ border: "none", background: "none", color: T.blue, fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                  >
                    View File
                  </button>
                </div>
                {doc.extra && (
                  <div style={{ fontSize: 11, color: T.inkLight, borderTop: `1px dashed ${T.border}`, marginTop: 6, paddingTop: 4 }}>
                    {doc.extra}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDocsVerifyPreview = (record) => {
    const docList = [
      { key: "aadhar", label: "Aadhaar Card", file: record.aadhar_card, extra: `Aadhaar Number: ${record.aadhar_number || "—"}` },
      { key: "pan", label: "PAN Card", file: record.pan_card, extra: `PAN Number: ${record.pan_number || "—"}` },
      { key: "bank_details", label: "Bank Passbook / Cheque", file: record.bank_passbook, extra: `Bank: ${record.bank_name || "—"} | A/C: ${record.bank_account_number || "—"} | IFSC: ${record.bank_ifsc || "—"} | Holder: ${record.bank_holder_name || "—"}` },
      { key: "photo", label: "Passport Photo", file: record.passport_photo },
      { key: "driving_license", label: "Driving License", file: record.driving_license },
      { key: "class10", label: "Class 10 Marksheet", file: record.class10_marksheet },
      { key: "class12", label: "Class 12 Marksheet", file: record.class12_marksheet },
      { key: "degree", label: "Degree Certificate", file: record.degree_certificate },
      { key: "experience_cert", label: "Experience Certificate", file: record.experience_certificate },
      { key: "prof_cert", label: "Professional Certificate", file: record.professional_certificate },
    ].filter(item => item.file);

    let verifiedList = [];
    let rejectedList = [];
    try {
      verifiedList = JSON.parse(record.verified_docs || "[]");
    } catch {}
    try {
      rejectedList = JSON.parse(record.rejected_docs || "[]");
    } catch {}

    const getFilename = (url) => {
      if (!url) return "";
      return url.split("/").pop();
    };

    const getFullUrl = (url) => {
      if (!url) return "";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      const hostname = window.location.hostname;
      const port = 8000;
      return `http://${hostname}:${port}${url}`;
    };

    return (
      <div style={{ fontSize: 13, color: T.inkMid }}>
        <div style={{ marginBottom: 12 }}><strong>Verify Uploaded Files:</strong></div>
        {docList.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", color: T.inkFaint }}>No documents uploaded yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {docList.map((doc) => {
              const isVerified = verifiedList.includes(doc.key);
              const isRejected = rejectedList.includes(doc.key);

              return (
                <div key={doc.key} style={{ display: "flex", flexDirection: "column", padding: "10px 14px", background: T.canvas, borderRadius: 8, border: `1px solid ${isVerified ? "#A7F3D0" : isRejected ? "#FECACA" : T.border}`, gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: T.ink }}>{doc.label}</div>
                      <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{getFilename(doc.file)}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => window.open(getFullUrl(doc.file), "_blank")}
                        style={{ border: "none", background: "none", color: T.blue, fontWeight: 700, cursor: "pointer", fontSize: 12, marginRight: 8 }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleDocVerification(record, doc.key, "Verified")}
                        style={{
                          border: "none",
                          background: isVerified ? T.green : "transparent",
                          color: isVerified ? "#fff" : T.green,
                          border: `1.5px solid ${T.green}`,
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: 12,
                          transition: "all 0.15s",
                        }}
                        title="Verify Document"
                      >✓</button>
                      <button
                        onClick={() => handleToggleDocVerification(record, doc.key, "Rejected")}
                        style={{
                          border: "none",
                          background: isRejected ? T.red : "transparent",
                          color: isRejected ? "#fff" : T.red,
                          border: `1.5px solid ${T.red}`,
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: 10,
                          transition: "all 0.15s",
                        }}
                        title="Reject Document"
                      >✗</button>
                    </div>
                  </div>
                  {doc.extra && (
                    <div style={{ fontSize: 11, color: T.inkLight, borderTop: `1px dashed ${T.border}`, marginTop: 6, paddingTop: 4 }}>
                      {doc.extra}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderBgcPreview = (_record) => (
    <div style={{ fontSize: 13, color: T.inkMid }}>
      <div style={{ marginBottom: 12 }}><strong>Background Check Details:</strong></div>
      <div style={{ padding: 12, background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Criminal Record Check</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: T.green, background: T.greenLight, padding: "2px 8px", borderRadius: 4 }}>CLEAR</span>
        </div>
        <div style={{ fontSize: 11, color: T.inkLight }}>No matching records found in national databases.</div>
      </div>
      <div style={{ padding: 12, background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}`, marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Address Verification</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: T.green, background: T.greenLight, padding: "2px 8px", borderRadius: 4 }}>VERIFIED</span>
        </div>
        <div style={{ fontSize: 11, color: T.inkLight }}>Current and permanent addresses physically verified.</div>
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle title="Onboarding" sub="Track every new joiner from offer acceptance to Day 1" />

      {enrichedPostings.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>
              {selectedPostingId ? (
                <span>
                  Filtering by <span style={{ color: accentColor }}>{selectedRole}</span>
                  <button onClick={() => selectPosting(null)} style={{ marginLeft: 8, fontSize: 11, color: T.inkFaint, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>Clear ×</button>
                </span>
              ) : (
                <span style={{ color: T.inkFaint }}>Select a job to filter onboarding records</span>
              )}
            </div>
            {!isMobile && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => scrollCarousel("left")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={() => scrollCarousel("right")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </div>
            )}
          </div>

          {isMobile ? (
            <>
              <div
                ref={hScroll.ref}
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const cardWidth = e.currentTarget.clientWidth;
                  if (cardWidth > 0) { const newIndex = Math.round(scrollLeft / cardWidth); setFilterActiveIndex(newIndex); }
                }}
                style={{ display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", gap: 12, paddingBottom: 4 }}
              >
                <div
                  onClick={() => { selectPosting(null); setFilterActiveIndex(0); if (hScroll.ref.current) { const cards = hScroll.ref.current.children; if (cards[0]) cards[0].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } }}
                  style={{ flexShrink: 0, width: "100%", border: `2px solid ${!selectedPostingId ? accentColor : T.border}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", background: !selectedPostingId ? accentPale : T.surface, display: "flex", flexDirection: "row", alignItems: "center", gap: 16, transition: "all 0.2s", boxShadow: !selectedPostingId ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)" }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: !selectedPostingId ? accentColor : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>◈</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink }}>All Jobs</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{records.length} total joiners</div>
                  </div>
                  {!selectedPostingId && <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>}
                </div>

                {enrichedPostings.map((p, idx) => {
                  const isSelected = selectedPostingId === p.id;
                  const initials = p.role.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                  return (
                    <div
                      key={p.id}
                      onClick={() => { selectPosting(p.id); setFilterActiveIndex(idx + 1); if (hScroll.ref.current) { const cards = hScroll.ref.current.children; if (cards[idx + 1]) cards[idx + 1].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } }}
                      style={{ flexShrink: 0, width: "100%", border: `2px solid ${isSelected ? accentColor : T.border}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", background: isSelected ? accentPale : T.surface, transition: "all 0.2s", boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: isSelected ? accentColor : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: isSelected ? "#fff" : T.inkMid }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.role}</div>
                          <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{p.channel} Posting</div>
                        </div>
                        {isSelected && <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 11, borderRadius: 99, padding: "3px 10px", fontWeight: 700, background: p.type === "Full-time" ? T.blueLight : T.tealLight, color: p.type === "Full-time" ? T.blue : T.teal }}>{p.type}</span>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? accentColor : T.ink }}>{p.onboardCount}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>joiners</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {[null, ...enrichedPostings.map((p) => p.id)].map((id, i) => (
                  <div key={i} onClick={() => { if (id === null) selectPosting(null); else selectPosting(id); setFilterActiveIndex(i); if (hScroll.ref.current) { const cards = hScroll.ref.current.children; if (cards[i]) cards[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } }} style={{ width: filterActiveIndex === i ? 20 : 6, height: 6, borderRadius: 99, background: filterActiveIndex === i ? accentColor : T.border, cursor: "pointer", transition: "all 0.2s" }} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 8, width: 40, zIndex: 2, background: `linear-gradient(to right, ${T.canvas}, transparent)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 8, width: 40, zIndex: 2, background: `linear-gradient(to left, ${T.canvas}, transparent)`, pointerEvents: "none" }} />
              <div ref={hScroll.ref} className="carousel-scroll hscroll-track" onWheel={hScroll.onWheel} onMouseDown={hScroll.onMouseDown} onMouseMove={hScroll.onMouseMove} onMouseUp={hScroll.onMouseUp} onMouseLeave={hScroll.onMouseLeave} style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", cursor: "grab", userSelect: "none" }}>
                <div onClick={() => selectPosting(null)} style={{ flexShrink: 0, width: 200, border: `2px solid ${!selectedPostingId ? accentColor : T.border}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", background: !selectedPostingId ? accentPale : T.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s", minHeight: 140 }}>
                  <div style={{ fontSize: 24, opacity: 0.5 }}>◈</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink, textAlign: "center" }}>All Jobs</div>
                  <div style={{ fontSize: 11, color: T.inkFaint, textAlign: "center" }}>{records.length} joiners</div>
                </div>

                {enrichedPostings.map((p) => {
                  const isSelected = selectedPostingId === p.id;
                  return (
                    <div key={p.id} onClick={() => selectPosting(p.id)} style={{ flexShrink: 0, width: 280, border: `2px solid ${isSelected ? accentColor : T.border}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", background: isSelected ? accentPale : T.surface, transition: "all 0.18s", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 140, boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, flex: 1 }}>{p.role}</div>
                          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px", background: p.type === "Full-time" ? T.blueLight : T.tealLight, color: p.type === "Full-time" ? T.blue : T.teal }}>{p.type}</span>
                        </div>
                        <div style={{ fontSize: 11, color: T.inkLight }}>{p.channel} Posting</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: T.inkMid }}><strong>{p.onboardCount}</strong> joiners</span>
                        {isSelected && <span style={{ fontSize: 10, fontWeight: 700, background: accentColor, color: "#fff", borderRadius: 99, padding: "2px 8px" }}>Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <Card style={{ padding: 32, textAlign: "center", color: T.inkFaint }}>No onboarding candidates found for this role.</Card>
      ) : isMobile ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {filteredRecords.length} candidate{filteredRecords.length !== 1 ? "s" : ""}
          </div>

          <div ref={scrollRef} onScroll={(e) => { const scrollLeft = e.currentTarget.scrollLeft; const cardWidth = e.currentTarget.clientWidth; const newIndex = Math.round(scrollLeft / cardWidth); setCurrentCardIndex(newIndex); }} style={{ display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", gap: 16, padding: "0 16px 20px", margin: "0 -16px" }}>
            {filteredRecords.map((o, idx) => {
              const done = TASK_KEYS.filter((k) => isTaskDone(k, o.tasks[k])).length;
              const pct = Math.round((done / TASK_KEYS.length) * 100);
              const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
              return (
                <div key={o.id} onClick={() => setSelectedRecord(o)} style={{ flexShrink: 0, minWidth: "calc(100% - 32px)", borderRadius: 20, background: cardBackground, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24, position: "relative", boxShadow: "0 14px 40px rgba(0,0,0,0.25)", cursor: "pointer", minHeight: 460 }}>
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>{idx + 1} of {filteredRecords.length}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>👤</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{o.name}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{o.role} · Joining: <strong>{o.joining}</strong></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 18, border: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: 12, marginTop: 16, flex: 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Candidate ID</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.id}</div>
                      </div>
                      {o.empId !== "—" && (
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Employee ID</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{o.empId}</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Progress</div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: pct === 100 ? "#34D399" : "#60A5FA" }}>{pct}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Status</div>
                        <div style={{ marginTop: 2 }}><Badge label={o.status} variant={statusVariant(o.status)} /></div>
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 99, height: 6, overflow: "hidden", margin: "4px 0" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, transition: "width 0.4s", background: pct === 100 ? "#10B981" : "linear-gradient(90deg, #3B82F6, #06B6D4)" }} />
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                      <div style={{ position: "absolute", left: "8.33%", right: "8.33%", top: 26, height: 2, background: "rgba(255,255,255,0.15)", zIndex: 0 }} />
                      {TASK_KEYS.map((key, i) => {
                        const val = o.tasks[key];
                        const isDone = isTaskDone(key, val);
                        const isRejected = val === "Rejected";
                        const stepNum = i + 1;
                        let stepLabel = "";
                        switch(key) {
                          case "profile": stepLabel = "Profile"; break;
                          case "offer": stepLabel = "Offer"; break;
                          case "docsUpload": stepLabel = "Upload"; break;
                          case "docsVerify": stepLabel = "Verify"; break;
                          case "bgc": stepLabel = "BGC"; break;
                          case "checkin": stepLabel = "Day 1"; break;
                        }
                        let circleBg = "rgba(255,255,255,0.1)";
                        let circleBorder = "rgba(255,255,255,0.2)";
                        let circleColor = "rgba(255,255,255,0.7)";
                        let circleText = `${stepNum}`;
                        if (isDone) { circleBg = "#10B981"; circleBorder = "#34D399"; circleColor = "#fff"; circleText = "✓"; }
                        else if (isRejected) { circleBg = "#EF4444"; circleBorder = "#F87171"; circleColor = "#fff"; circleText = "✗"; }
                        return (
                          <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, zIndex: 1 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: circleBg, border: `2px solid ${circleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: circleColor, transition: "all 0.3s", boxShadow: isDone ? "0 0 8px rgba(16,185,129,0.4)" : isRejected ? "0 0 8px rgba(239,68,68,0.4)" : "none" }}>{circleText}</div>
                            <span style={{ fontSize: 9, fontWeight: 700, color: isDone ? "#34D399" : isRejected ? "#F87171" : "rgba(255,255,255,0.5)", marginTop: 6, textAlign: "center", whiteSpace: "nowrap" }}>{stepLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRecords.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
              {filteredRecords.map((_, i) => (
                <div key={i} onClick={() => scrollRef.current?.scrollTo({ left: (i * scrollRef.current.clientWidth), behavior: "smooth" })} style={{ width: 8, height: 8, borderRadius: "50%", background: currentCardIndex === i ? T.primary : T.border, cursor: "pointer", transition: "all 0.3s" }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredRecords.map((o) => {
            const done = TASK_KEYS.filter((k) => isTaskDone(k, o.tasks[k])).length;
            const pct = Math.round((done / TASK_KEYS.length) * 100);
            return (
              <div
                key={o.id}
                onClick={() => setSelectedRecord(o)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
              >
                <Card style={{ padding: isMobile ? 16 : 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <Mono v={o.id} />
                        <Badge label={o.status} variant={statusVariant(o.status)} />
                      </div>
                      <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: T.ink }}>{o.name}</div>
                      <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                        {o.role} · Joining: <strong>{o.joining}</strong>
                        {o.empId !== "—" && <> · ID: <strong>{o.empId}</strong></>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12 }}>
                      <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: pct === 100 ? T.green : T.blue }}>{pct}%</div>
                      <div style={{ fontSize: 10, color: T.inkFaint }}>Complete</div>
                    </div>
                  </div>

                  <div style={{ background: T.canvas, borderRadius: 99, height: 7, overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, transition: "width 0.6s", background: pct === 100 ? T.green : `linear-gradient(90deg,${T.blue},${T.teal})` }} />
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {TASK_LABELS.map((t, i) => {
                      const { icon, color, bg, border } = getTaskIconAndColor(TASK_KEYS[i], o.tasks[TASK_KEYS[i]]);
                      return (
                        <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: "6px 10px" }}>
                          <span style={{ color: color, fontSize: 13 }}>{icon}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: color === T.inkFaint ? T.inkMid : color }}>{t}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)} maxWidth={640}>
        {currentRecord && (() => {
          const candDetails = getCandidateDetails(currentRecord.name);
          const done = TASK_KEYS.filter((k) => isTaskDone(k, currentRecord.tasks[k])).length;
          const pct = Math.round((done / TASK_KEYS.length) * 100);
          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.ink }}>Onboarding Checklist & Details</h2>
                <button onClick={() => setSelectedRecord(null)} style={{ background: "none", border: "none", fontSize: 20, fontWeight: 700, color: T.inkFaint, cursor: "pointer", padding: 0 }}>✕</button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Mono v={currentRecord.id} />
                    <Badge label={currentRecord.status} variant={statusVariant(currentRecord.status)} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{currentRecord.name}</div>
                  <div style={{ fontSize: 12, color: T.inkMid, marginTop: 4 }}>Role: <strong>{currentRecord.role}</strong></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: pct === 100 ? T.green : T.blue }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: T.inkFaint }}>Progress</div>
                </div>
              </div>

              <div style={{ background: T.canvas, borderRadius: 99, height: 7, overflow: "hidden", marginBottom: 18 }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, transition: "width 0.4s", background: pct === 100 ? T.green : `linear-gradient(90deg,${T.blue},${T.teal})` }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 20, padding: "14px 16px", background: T.canvas, borderRadius: 10, border: `1px solid ${T.border}` }}>
                {[
                  { label: "Joining Date", value: currentRecord.joining },
                  { label: "Employee ID", value: currentRecord.empId },
                  { label: "Email", value: candDetails.email },
                  { label: "Phone", value: candDetails.phone },
                  { label: "Monthly CTC", value: candDetails.ctc },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Resume</div>
                  <div style={{ fontSize: 13 }}>
                    {candDetails.resume ? (
                      <a href={candDetails.resume} target="_blank" rel="noreferrer" style={{ color: T.blue, textDecoration: "none", fontWeight: 600 }}>View Resume ↗</a>
                    ) : (
                      <span style={{ color: T.inkFaint }}>—</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.inkMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Onboarding Checklist & Document Verification</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TASK_LABELS.map((t, i) => {
                    const key = TASK_KEYS[i];
                    const val = currentRecord.tasks[key];

                    if (key === "checkin") {
                      const allPriorVerified = ["profile", "offer", "docsUpload", "docsVerify", "bgc"].every(
                        (k) => currentRecord.tasks[k] === "Verified"
                      );
                      const isDone = !!val;
                      const canCheckIn = isDone || allPriorVerified;

                      return (
                        <button
                          key={t}
                          onClick={() => { if (!canCheckIn) return; toggleTask(currentRecord.id, "checkin"); }}
                          disabled={!canCheckIn}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: canCheckIn ? "pointer" : "not-allowed", padding: "12px 16px", borderRadius: 10, background: isDone ? T.greenLight : canCheckIn ? "linear-gradient(135deg, #EFF6FF 0%, #E0F2FE 100%)" : T.canvas, border: `1.5px solid ${isDone ? "#A7F3D0" : canCheckIn ? T.blue : T.border}`, width: "100%", textAlign: "left", transition: "all 0.2s", opacity: canCheckIn ? 1 : 0.55 }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isDone ? T.green : canCheckIn ? T.blue : T.inkFaint}`, background: isDone ? T.green : "transparent", color: "#fff", fontSize: 11, fontWeight: 800 }}>{isDone ? "✓" : canCheckIn ? "" : "🔒"}</span>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: isDone ? "#065F46" : canCheckIn ? T.blue : T.inkFaint }}>{t}</span>
                              {!canCheckIn && <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 2 }}>Complete all verification steps first</div>}
                            </div>
                          </div>
                          {canCheckIn && !isDone && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: T.blue, borderRadius: 6, padding: "4px 12px" }}>Check In Now</span>}
                          {isDone && <span style={{ fontSize: 11, fontWeight: 700, color: T.green, background: "rgba(16,185,129,0.1)", borderRadius: 6, padding: "4px 12px" }}>✓ Checked In</span>}
                        </button>
                      );
                    }

                    const isSpecialField = key === "profile" || key === "offer" || key === "docsUpload" || key === "docsVerify" || key === "bgc";

                    if (isSpecialField) {
                      const statusColor = val === "Verified" ? T.green : val === "Rejected" ? T.red : T.inkFaint;
                      const statusBg = val === "Verified" ? T.greenLight : val === "Rejected" ? T.redLight : T.canvas;
                      const statusBorder = val === "Verified" ? "#A7F3D0" : val === "Rejected" ? "#FECACA" : T.border;

                      return (
                        <div
                          key={t}
                          style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", padding: "10px 14px", borderRadius: 8, background: statusBg, border: `1.5px solid ${statusBorder}`, gap: 10, transition: "all 0.15s" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", border: `2px solid ${statusColor}`, background: val === "Verified" ? T.green : val === "Rejected" ? T.red : "transparent", color: "#fff", fontSize: 10, fontWeight: 800 }}>{val === "Verified" ? "✓" : val === "Rejected" ? "✗" : ""}</span>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: val === "Verified" ? "#065F46" : val === "Rejected" ? "#991B1B" : T.ink }}>{t}</span>
                              <span style={{ fontSize: 9, fontWeight: 800, marginLeft: 8, padding: "2px 6px", borderRadius: 4, color: statusColor, background: val === "Verified" ? "rgba(16, 185, 129, 0.1)" : val === "Rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(156, 163, 175, 0.1)" }}>{val || "Pending"}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 6, width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "flex-end" : "flex-start" }}>
                            <button
                              onClick={() => {
                                let title = "";
                                if (key === "profile") title = "Candidate Profile";
                                else if (key === "offer") title = "Offer Letter Details";
                                else if (key === "docsUpload") title = "Uploaded Documents";
                                else if (key === "docsVerify") title = "Document Verification Checks";
                                else if (key === "bgc") title = "Background Check Details";
                                setPreviewDoc({ type: key, title });
                              }}
                              style={{ border: `1.5px solid ${T.border}`, background: T.surface, color: T.blue, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                            >View</button>
                            {(key === "docsVerify" || key === "bgc") && (
                              <>
                                <button
                                  disabled={key === "docsVerify" && !areAllDocsVerified(currentRecord)}
                                  onClick={() => setConfirmAction({ id: currentRecord.id, key, status: "Verified" })}
                                  style={{
                                    border: "none",
                                    background: (key === "docsVerify" && !areAllDocsVerified(currentRecord)) ? T.canvas : T.greenLight,
                                    color: (key === "docsVerify" && !areAllDocsVerified(currentRecord)) ? T.inkFaint : T.green,
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: (key === "docsVerify" && !areAllDocsVerified(currentRecord)) ? "not-allowed" : "pointer",
                                    opacity: (key === "docsVerify" && !areAllDocsVerified(currentRecord)) ? 0.6 : 1
                                  }}
                                >Verify</button>
                                <button onClick={() => setConfirmAction({ id: currentRecord.id, key, status: "Rejected" })} style={{ border: "none", background: T.redLight, color: T.red, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Reject</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      const isDone = val;
                      return (
                        <button key={t} onClick={() => toggleTask(currentRecord.id, key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "10px 14px", borderRadius: 8, background: isDone ? T.greenLight : T.surface, border: `1.5px solid ${isDone ? "#A7F3D0" : T.border}`, width: "100%", textAlign: "left", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isDone ? T.green : T.inkFaint}`, background: isDone ? T.green : "transparent", color: "#fff", fontSize: 10, fontWeight: 800 }}>{isDone ? "✓" : ""}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isDone ? "#065F46" : T.ink }}>{t}</span>
                          </div>
                        </button>
                      );
                    }
                  })}
                </div>
              </div>
            </>
          );
        })()}
      </Modal>

      <Modal open={!!previewDoc} onClose={() => setPreviewDoc(null)} maxWidth={500}>
        {previewDoc && (() => {
          let content = null;
          const candDetails = getCandidateDetails(currentRecord.name);
          if (previewDoc.type === "profile") content = renderProfilePreview(currentRecord, candDetails);
          else if (previewDoc.type === "offer") content = renderOfferPreview(currentRecord, candDetails);
          else if (previewDoc.type === "docsUpload") content = renderDocsUploadPreview(currentRecord);
          else if (previewDoc.type === "docsVerify") content = renderDocsVerifyPreview(currentRecord);
          else if (previewDoc.type === "bgc") content = renderBgcPreview(currentRecord);

          return (
            <>
              <ModalHeader title={previewDoc.title} onClose={() => setPreviewDoc(null)} />
              <div style={{ padding: "12px 0" }}>{content}</div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <Btn label="Close" onClick={() => setPreviewDoc(null)} />
              </div>
            </>
          );
        })()}
      </Modal>

      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} maxWidth={400}>
        {confirmAction && (
          <>
            <ModalHeader title="Confirm Action" onClose={() => setConfirmAction(null)} />
            <div style={{ padding: "12px 0", color: T.inkMid, fontSize: 14 }}>
              Are you sure you want to mark this task as <strong style={{ color: confirmAction.status === "Verified" ? T.green : T.red }}>{confirmAction.status}</strong>? This action cannot be undone.
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn label="Cancel" variant="outline" onClick={() => setConfirmAction(null)} />
              <button
                onClick={() => { setTaskStatus(confirmAction.id, confirmAction.key, confirmAction.status); setConfirmAction(null); }}
                style={{ background: confirmAction.status === "Verified" ? T.green : T.red, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Yes, {confirmAction.status}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
