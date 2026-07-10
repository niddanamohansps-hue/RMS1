import { useState, useRef, useEffect } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Btn, Input, Select, Badge, FormField } from "../components/ui";
import { VACANCY_OPTIONS, QUAL_OPTIONS, TYPE_OPTIONS, CATEGORY_OPTIONS, SKILLS_LIST } from "../data";

const getStatusStyle = (status) => {
  switch (status) {
    case "Approved": return { border: `1.5px solid ${T.green}`, background: T.greenLight, color: T.green };
    case "Rejected": return { border: "1.5px solid #DC2626", background: "#FEE2E2", color: "#DC2626" };
    case "Cancelled": return { border: "1.5px solid #6B7280", background: "#F3F4F6", color: "#6B7280" };
    case "Sent Back": return { border: `1.5px solid ${T.amber}`, background: T.amberLight, color: T.amber };
    default: return { border: `1.5px solid ${T.blue}`, background: T.blueLight, color: T.blue };
  }
};

const emptyForm = () => ({
  id: Date.now() + Math.random(),
  department: "",
  role: "",
  vacancies: "",
  exp: "",
  qual: "",
  type: "",
  salary: "",
  location: "",
  category: "",
  description: "",
  justification: "",
  educationalQualifications: "",
  skillsRequired: "",
  status: "Pending",
  comment: "",
});

function SkillsMultiSelect({ selected = "", onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedArray = selected ? selected.split(",").map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggle = (opt) => {
    const next = selectedArray.includes(opt)
      ? selectedArray.filter(s => s !== opt)
      : [...selectedArray, opt];
    onChange(next.join(", "));
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", fontFamily: "inherit" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: `1.5px solid ${T.border}`,
          borderRadius: 8,
          padding: "9px 13px",
          fontSize: 13,
          background: "#fff",
          minHeight: 38,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          cursor: "pointer",
          boxSizing: "border-box",
          paddingRight: 32,
          position: "relative",
        }}
      >
        {selectedArray.length === 0 && (
          <span style={{ color: T.inkFaint }}>Select required skills...</span>
        )}
        {selectedArray.map(s => (
          <span
            key={s}
            onClick={(e) => { e.stopPropagation(); toggle(s); }}
            style={{
              background: T.primaryLight,
              color: T.primary,
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {s} <span style={{ fontSize: 13, lineHeight: 1 }}>&times;</span>
          </span>
        ))}
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: T.inkFaint }}>
          ▼
        </span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 200,
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          {SKILLS_LIST.map((opt) => {
            const isSel = selectedArray.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  background: isSel ? T.primaryLight : "transparent",
                  color: isSel ? T.primary : T.ink,
                  fontWeight: isSel ? 700 : 400,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = T.canvas; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              >
                {opt}
                {isSel && <span style={{ color: T.primary, fontWeight: "bold" }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function QualificationsMultiSelect({ selected = "", onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedArray = selected ? selected.split(",").map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggle = (opt) => {
    const next = selectedArray.includes(opt)
      ? selectedArray.filter(s => s !== opt)
      : [...selectedArray, opt];
    onChange(next.join(", "));
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", fontFamily: "inherit" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: `1.5px solid ${open ? T.accent : T.border}`,
          boxShadow: open ? "0 0 0 3px rgba(201, 168, 76, 0.12)" : "none",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 13,
          background: "#fff",
          minHeight: 38,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          cursor: "pointer",
          boxSizing: "border-box",
          paddingRight: 32,
          position: "relative",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {selectedArray.length === 0 && (
          <span style={{ color: T.inkFaint }}>Select qualification...</span>
        )}
        {selectedArray.map(s => (
          <span
            key={s}
            onClick={(e) => { e.stopPropagation(); toggle(s); }}
            style={{
              background: T.primaryLight,
              color: T.primary,
              border: "1px solid #E8D0D8",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.primaryPale;
              e.currentTarget.style.borderColor = "#DDBBC5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.primaryLight;
              e.currentTarget.style.borderColor = "#E8D0D8";
            }}
          >
            {s} <span style={{ fontSize: 13, lineHeight: 1, fontWeight: "normal" }}>&times;</span>
          </span>
        ))}
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, display: "flex", alignItems: "center", pointerEvents: "none" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <path fill="#6B6B6B" d="M6 8L1 3h10z" />
          </svg>
        </span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 200,
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          {QUAL_OPTIONS.map((optObj) => {
            const opt = optObj.value;
            const isSel = selectedArray.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  background: isSel ? T.primaryLight : "transparent",
                  color: isSel ? T.primary : T.ink,
                  fontWeight: isSel ? 700 : 400,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = T.canvas; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              >
                <span>{opt}</span>
                {isSel && <span style={{ color: T.primary, fontWeight: "bold" }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const chatAvatar = (name) => {
  const initials = (name || "U").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const colors = ["#E0F2FE", "#F3E8FF", "#FFE4E6", "#FEF3C7", "#D1FAE5", "#F1F5F9"];
  const textColors = ["#0369A1", "#6B21A8", "#BE123C", "#B45309", "#047857", "#475569"];
  const code = (name || "").charCodeAt(0) || 0;
  const index = code % colors.length;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: colors[index], color: textColors[index],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 11, flexShrink: 0,
      border: `1.5px solid ${T.white || "#ffffff"}`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }}>
      {initials}
    </div>
  );
};

export default function JobRequests({ currentUser, jobRequests, setJobRequests, setApprovalRequests, setJobPostings, existingRoles, onNavigateToApplications }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [showForm, setShowForm] = useState(false);
  const [jobForms, setJobForms] = useState([emptyForm()]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [originalRequest, setOriginalRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef(null);

  const statuses = ["All", "Pending", "Approved", "Rejected", "Cancelled", "Sent Back"];

  const filteredRequests = jobRequests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => {
      const query = search.toLowerCase();
      return (
        (r.role || "").toLowerCase().includes(query) ||
        (r.location || "").toLowerCase().includes(query) ||
        (String(r.id) || "").toLowerCase().includes(query)
      );
    });

  const counts = statuses.reduce((acc, status) => {
    acc[status] = status === "All"
      ? jobRequests.length
      : jobRequests.filter((r) => r.status === status).length;
    return acc;
  }, {});

  const deptOptions = [...new Set((existingRoles || []).map((r) => r.dept))].filter(Boolean).map((d) => ({ value: d, label: d }));

  const getFilteredRoleOptions = (selectedDept) => {
    const roles = existingRoles || [];
    const filtered = selectedDept ? roles.filter((r) => r.dept === selectedDept) : roles;
    return filtered.map((r) => ({ value: r.role, label: r.role }));
  };

  const updateForm = (index, key, value) => {
    setJobForms((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const handleDepartmentChange = (index, selectedDept) => {
    updateForm(index, "department", selectedDept);
    const matchingRole = (existingRoles || []).find((r) => r.role === jobForms[index].role);
    if (matchingRole && matchingRole.dept !== selectedDept) {
      updateForm(index, "role", "");
    }
  };

  const handleRoleChange = (index, selectedRole) => {
    updateForm(index, "role", selectedRole);
    const matchingRole = (existingRoles || []).find((r) => r.role === selectedRole);
    if (matchingRole) {
      updateForm(index, "department", matchingRole.dept || "");
      updateForm(index, "exp", matchingRole.experience || "");
      updateForm(index, "salary", matchingRole.salaryRange || "");
      updateForm(index, "type", matchingRole.type || "Full-time");
    }
  };

  const handleDepartmentChangeInModal = (selectedDept) => {
    if (!selectedRequest) return;
    const matchingRole = (existingRoles || []).find((r) => r.role === selectedRequest.role);
    setSelectedRequest({
      ...selectedRequest,
      department: selectedDept,
      role: (matchingRole && matchingRole.dept !== selectedDept) ? "" : selectedRequest.role
    });
  };

  const handleRoleChangeInModal = (selectedRole) => {
    if (!selectedRequest) return;
    const matchingRole = (existingRoles || []).find((r) => r.role === selectedRole);
    setSelectedRequest({
      ...selectedRequest,
      role: selectedRole,
      department: matchingRole ? (matchingRole.dept || "") : selectedRequest.department,
      exp: matchingRole ? (matchingRole.experience || "") : selectedRequest.exp,
      salary: matchingRole ? (matchingRole.salaryRange || "") : selectedRequest.salary,
      type: matchingRole ? (matchingRole.type || "Full-time") : selectedRequest.type,
    });
  };

  const saveJobRequestEdits = (submitAsPending) => {
    if (!selectedRequest) return;
    const updated = {
      ...selectedRequest,
      status: submitAsPending ? "Pending" : selectedRequest.status,
    };

    setJobRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));

    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const hasChanges = () => {
    if (!selectedRequest || !originalRequest) return false;
    return (
      selectedRequest.role !== originalRequest.role ||
      selectedRequest.department !== originalRequest.department ||
      selectedRequest.location !== originalRequest.location ||
      selectedRequest.vacancies !== originalRequest.vacancies ||
      selectedRequest.exp !== originalRequest.exp ||
      selectedRequest.qual !== originalRequest.qual ||
      selectedRequest.type !== originalRequest.type ||
      selectedRequest.salary !== originalRequest.salary ||
      selectedRequest.category !== originalRequest.category ||
      selectedRequest.description !== originalRequest.description ||
      selectedRequest.justification !== originalRequest.justification ||
      selectedRequest.educationalQualifications !== originalRequest.educationalQualifications ||
      selectedRequest.skillsRequired !== originalRequest.skillsRequired
    );
  };

  const approveDirectly = () => {
    if (!selectedRequest) return;
    const now = new Date().toLocaleDateString();
    const entry = { act: "Approved", by: "HR Admin", date: now, note: "" };
    const updated = {
      ...selectedRequest,
      status: "Approved",
      history: [...(selectedRequest.history || []), entry],
    };
    setJobRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));
    setJobPostings((prev) => {
      const alreadyExists = prev.some((p) => p.role === selectedRequest.role);
      if (alreadyExists) return prev;
      return [
        ...prev,
        {
          id: `POST-${Date.now()}`,
          role: selectedRequest.role,
          channel: "Career Page",
          status: "Unpublished",
          posted: now,
          expiry: "30 Days",
          apps: 0,
          location: selectedRequest.location || "",
          salary: selectedRequest.salary || "",
          vacancies: selectedRequest.vacancies || "",
          exp: selectedRequest.experience || selectedRequest.exp || "",
          qual: selectedRequest.educationalQualifications || "",
          type: selectedRequest.type || "",
          description: selectedRequest.description || "",
          educationalQualifications: selectedRequest.educationalQualifications || "",
          skillsRequired: selectedRequest.skillsRequired || "",
          job_request: selectedRequest.db_id,
          department: selectedRequest.department || selectedRequest.dept || "",
          category: selectedRequest.category || "",
        },
      ];
    });
    if (onNavigateToApplications) {
      setTimeout(() => { onNavigateToApplications(); }, 300);
    }
    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const handleAccept = () => {
    if (hasChanges()) {
      saveJobRequestEdits(true);
    } else {
      approveDirectly();
    }
  };

  const cancelJobRequest = (reqId) => {
    setJobRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "Cancelled" } : r))
    );
    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const handleRequestSelect = (req) => {
    const isEditable = req.status === "Pending" || req.status === "Sent Back";
    setSelectedRequest({
      ...req,
      justification: isEditable ? "" : req.justification
    });
    setOriginalRequest(req);
    setShowViewModal(true);
  };

  const openNew = () => {
    setEditingId(null);
    setJobForms([emptyForm()]);
    setShowForm(true);
  };

  const submitRequests = () => {
    if (editingId !== null) {
      setJobRequests((prev) => prev.map((r) => r.id === editingId ? { ...r, ...jobForms[0] } : r));
    } else {
      const now = new Date().toLocaleDateString();
      const newRequests = jobForms.map((f, i) => ({
        ...f,
        id: `JR-${Date.now()}-${i}`,
        status: "Pending",
        comment: "",
        date: now,
        history: [{ act: "Submitted", by: "Current User", date: now, note: "" }],
      }));
      setJobRequests((prev) => [...prev, ...newRequests]);
    }
    setJobForms([emptyForm()]);
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div>
      <SectionTitle
        title="Job Requests"
        sub="Define vacancies, qualifications, and compensation details"
        action={<Btn label="+ New Job Request" onClick={openNew} />}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Input
          placeholder="Search requests by role, location, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360, flex: 1 }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {statuses.map((status) => {
          const count = counts[status];
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                background: isActive ? T.primary : T.white,
                color: isActive ? "#fff" : T.ink,
                border: `1.5px solid ${isActive ? T.primary : T.border}`,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {status}
              <span
                style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : T.border,
                  color: isActive ? "#fff" : T.inkMid,
                  borderRadius: 99,
                  padding: "1px 6px",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {jobRequests.filter((r) => r.status === "Sent Back").map((r) => (
        <div
          key={r.id}
          style={{
            background: T.amberLight,
            border: `1px solid #FDE68A`,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <strong style={{ color: T.amber, fontSize: 13 }}>Action Required (Sent Back): </strong>
            <span style={{ fontSize: 13, color: T.ink }}>
              Job Request for <strong>{r.role}</strong> was returned with comment: <em>...</em>
            </span>
          </div>
          <Btn label="View Request" small variant="amber" onClick={() => { setSelectedRequest(r); setOriginalRequest(r); setShowViewModal(true); }} />
        </div>
      ))}

      {showForm && (
        <div style={{ marginBottom: 20 }}>
          {jobForms.map((form, index) => (
            <Card key={form.id} style={{ padding: 20, marginBottom: 16, borderTop: `3px solid ${T.blue}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
                  {editingId ? "Edit Job Request" : `Job Request #${index + 1}`}
                </div>
                {jobForms.length > 1 && (
                  <button onClick={() => setJobForms((p) => p.filter((_, i) => i !== index))}
                    style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                {/* Row 1 */}
                <FormField label="Department" required>
                  <Select value={form.department} onChange={(e) => handleDepartmentChange(index, e.target.value)} options={deptOptions} placeholder="Select department…" />
                </FormField>
                <FormField label="Role" required>
                  <Select value={form.role} onChange={(e) => handleRoleChange(index, e.target.value)} options={getFilteredRoleOptions(form.department)} placeholder="Select role…" />
                </FormField>
                <FormField label="Experience (Auto-populated)" required>
                  <Input placeholder="Select role first" value={form.exp} disabled style={{ background: T.canvas, cursor: "not-allowed" }} />
                </FormField>

                {/* Row 2 */}
                <FormField label="Salary Range (Auto-populated)" required>
                  <Input placeholder="Select role first" value={form.salary} disabled style={{ background: T.canvas, cursor: "not-allowed" }} />
                </FormField>
                <FormField label="Educational Qualification" required>
                  <QualificationsMultiSelect selected={form.qual} onChange={(val) => updateForm(index, "qual", val)} />
                </FormField>
                <FormField label="Vacancies" required>
                  <Select value={form.vacancies} onChange={(e) => updateForm(index, "vacancies", e.target.value)} options={VACANCY_OPTIONS} placeholder="Select count…" />
                </FormField>

                {/* Row 3 */}
                <FormField label="Employment Type (Auto-populated)" required>
                  <Select value={form.type} disabled options={TYPE_OPTIONS} placeholder="Select role first" style={{ background: T.canvas, cursor: "not-allowed" }} />
                </FormField>
                <FormField label="Location" required>
                  <Input placeholder="Enter job location" value={form.location} onChange={(e) => updateForm(index, "location", e.target.value)} />
                </FormField>
                <FormField label="Category" required>
                  <Select value={form.category} onChange={(e) => updateForm(index, "category", e.target.value)} options={CATEGORY_OPTIONS} placeholder="Select category…" />
                </FormField>
              </div>

              {/* Row 4 */}
              <div style={{ marginBottom: 14 }}>
                <FormField label="Required Skills" required>
                  <SkillsMultiSelect selected={form.skillsRequired} onChange={(val) => updateForm(index, "skillsRequired", val)} />
                </FormField>
              </div>

              {/* Row 5 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                <FormField label="Job Description" required>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm(index, "description", e.target.value)}
                    placeholder="Enter job description"
                    style={{ width: "100%", minHeight: 100, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
                  />
                </FormField>
                <FormField label="Justification" required>
                  <textarea
                    value={form.justification}
                    onChange={(e) => updateForm(index, "justification", e.target.value)}
                    placeholder="Why is this job needed?"
                    style={{ width: "100%", minHeight: 100, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
                  />
                </FormField>
              </div>
            </Card>
          ))}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <Btn label="Submit Request" onClick={submitRequests} />
            {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setJobForms((p) => [...p, emptyForm()])} />}
            <Btn label="Cancel" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setJobForms([emptyForm()]); }} />
          </div>
        </div>
      )}

      {isMobile ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
          </div>

          <div
            ref={scrollRef}
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const cardWidth = e.currentTarget.clientWidth;
              const newIndex = Math.round(scrollLeft / cardWidth);
              setCurrentCardIndex(newIndex);
            }}
            style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              gap: 16,
              padding: "0 16px 20px",
              margin: "0 -16px",
            }}
          >
            {filteredRequests.map((r, idx) => {
              const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
              return (
                <div
                  key={r.id}
                  onClick={() => handleRequestSelect(r)}
                  style={{
                    flexShrink: 0,
                    minWidth: "calc(100% - 32px)",
                    scrollSnapAlign: "center",
                    borderRadius: 20,
                    background: cardBackground,
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 24,
                    position: "relative",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
                    cursor: "pointer",
                    minHeight: 380,
                  }}
                >
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {idx + 1} of {filteredRequests.length}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 48, height: 48, borderRadius: "50%",
                          background: "rgba(255,255,255,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0,
                        }}
                      >
                        💼
                      </div>
                      <div style={{ paddingRight: 64 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                          {r.location || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 12,
                      padding: 18,
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      marginTop: 16,
                      flex: 1,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Request ID</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Vacancies</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.vacancies || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Experience</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.exp || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Type</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.type || "—"}</div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Salary</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{r.salary || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700, textAlign: "right" }}>Status</div>
                          <div style={{ marginTop: 2, textAlign: "right" }}>
                            <Badge label={r.status} variant={statusVariant(r.status)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRequests.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
              {filteredRequests.map((_, i) => (
                <div
                  key={i}
                  onClick={() => scrollRef.current?.scrollTo({ left: (i * scrollRef.current.clientWidth), behavior: "smooth" })}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: currentCardIndex === i ? T.primary : T.border,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <Table
            onRowClick={(index) => handleRequestSelect(filteredRequests[index])}
            cols={["Request ID", "Department", "Role", "Location", "Vacancies", "Experience", "Educational Qualification", "Required Skills", "Type", "Salary", "Status"]}
            rows={filteredRequests.map((r) => {
              const ss = getStatusStyle(r.status);
              return [
                <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
                r.department || "—",
                <strong>{r.role}</strong>,
                r.location || "—",
                r.vacancies || "—",
                r.exp || "—",
                r.qual || "—",
                <span style={{ fontSize: 12, color: T.inkLight, maxWidth: 150, display: "inline-block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.skillsRequired || "—"}</span>,
                r.type || "—",
                r.salary || "—",
                <span style={{ ...ss, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{r.status}</span>,
              ];
            })}
          />
        </Card>
      )}

      {showViewModal && selectedRequest && (
        <div
          onClick={() => { setShowViewModal(false); setSelectedRequest(null); setOriginalRequest(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(15,23,42,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.surface, borderRadius: 16, width: "100%", maxWidth: 580,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              position: "sticky", top: 0, background: T.surface, zIndex: 1,
              borderRadius: "16px 16px 0 0",
            }}>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <Badge label="Job Request" variant="blue" />
                  <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
                  {selectedRequest.role || "Job Request Details"}
                </div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                  {selectedRequest.location ? `${selectedRequest.location}` : ""}
                  {selectedRequest.date ? ` · ${selectedRequest.date}` : ""}
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setSelectedRequest(null); setOriginalRequest(null); }}
                style={{
                  background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 8,
                  width: 32, height: 32, fontSize: 18, color: T.inkMid, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, lineHeight: 1,
                }}
              >×</button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: T.canvas, borderRadius: 10, padding: 16, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                      {/* Row 1 */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Department</div>
                        <Select
                          value={selectedRequest.department || ""}
                          onChange={(e) => handleDepartmentChangeInModal(e.target.value)}
                          options={deptOptions}
                          placeholder="Select department…"
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role</div>
                        <Select
                          value={selectedRequest.role || ""}
                          onChange={(e) => handleRoleChangeInModal(e.target.value)}
                          options={getFilteredRoleOptions(selectedRequest.department)}
                          placeholder="Select role…"
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Experience (Auto-populated)</div>
                        <Input
                          placeholder="Select role first"
                          value={selectedRequest.exp || ""}
                          disabled
                          style={{ background: T.canvas, cursor: "not-allowed" }}
                        />
                      </div>

                      {/* Row 2 */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Salary Range (Auto-populated)</div>
                        <Input
                          placeholder="Select role first"
                          value={selectedRequest.salary || ""}
                          disabled
                          style={{ background: T.canvas, cursor: "not-allowed" }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Educational Qualification</div>
                        <QualificationsMultiSelect
                          selected={selectedRequest.qual || ""}
                          onChange={(val) => setSelectedRequest({ ...selectedRequest, qual: val })}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Vacancies</div>
                        <Select
                          value={selectedRequest.vacancies || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, vacancies: e.target.value })}
                          options={VACANCY_OPTIONS}
                          placeholder="Select count…"
                        />
                      </div>

                      {/* Row 3 */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Employment Type (Auto-populated)</div>
                        <Select
                          value={selectedRequest.type || ""}
                          options={TYPE_OPTIONS}
                          placeholder="Select role first"
                          disabled
                          style={{ background: T.canvas, cursor: "not-allowed" }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Location</div>
                        <Input
                          placeholder="Enter job location"
                          value={selectedRequest.location || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Category</div>
                        <Select
                          value={selectedRequest.category || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, category: e.target.value })}
                          options={CATEGORY_OPTIONS}
                          placeholder="Select category…"
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Required Skills</div>
                      <SkillsMultiSelect selected={selectedRequest.skillsRequired} onChange={(val) => setSelectedRequest({ ...selectedRequest, skillsRequired: val })} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Job Description</div>
                      <textarea
                        value={selectedRequest.description || ""}
                        onChange={(e) => setSelectedRequest({ ...selectedRequest, description: e.target.value })}
                        placeholder="Enter job description"
                        style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }}
                      />
                    </div>


                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Department</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.department || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{selectedRequest.role || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Experience</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.exp || "—"}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Salary Range</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{selectedRequest.salary || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Educational Qualification</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.qual || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Vacancies</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.vacancies || "—"}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Employment Type</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.type || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Location</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.location || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Category</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.category || "—"}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Required Skills</div>
                      <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.skillsRequired || "—"}</div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Job Description</div>
                      <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.description || "—"}</div>
                    </div>

                  </>
                )}
              </div>

              {selectedRequest.history?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Activity History</div>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    background: T.canvas || "#faf8f5",
                    border: `1px solid ${T.border || "#E8E2D9"}`,
                    borderRadius: 12,
                    padding: "16px 24px 16px 16px",
                    maxHeight: 400,
                    overflowY: "auto",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)"
                  }}>
                    {selectedRequest.history.map((h, i) => {
                      const isMe = h.act === "Submitted";

                      const hasNote = !!h.note;

                      if (!hasNote) {
                        return (
                          <div key={i} style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
                            <div style={{
                              background: "#F0F2F5",
                              color: "#54656F",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "4px 12px",
                              borderRadius: 8,
                              boxShadow: "0 1px 1px rgba(0,0,0,0.02)",
                              textAlign: "center"
                            }}>
                              {h.act} by {h.by} • {h.date}
                            </div>
                          </div>
                        );
                      }

                      const isApprove = h.act === "Approved" || h.act === "Approve";
                      const isSendBack = h.act === "Sent Back" || h.act === "Send Back";
                      const isReject = h.act === "Rejected" || h.act === "Reject";
                      
                      let bubbleBg = "#F3F4F6";
                      let bubbleBorder = "#E5E7EB";
                      let bubbleColor = T.ink;
                      let actLabel = h.act;
                      let badgeColor = T.inkLight;
                      let badgeBg = "#E5E7EB";

                      if (isApprove) {
                        bubbleBg = "#ECFDF5";
                        bubbleBorder = "#A7F3D0";
                        bubbleColor = "#065F46";
                        actLabel = "Approved";
                        badgeBg = "#D1FAE5";
                        badgeColor = "#047857";
                      } else if (isSendBack) {
                        bubbleBg = "#FFF7ED";
                        bubbleBorder = "#FDE68A";
                        bubbleColor = "#9A3412";
                        actLabel = "Sent Back";
                        badgeBg = "#FEF3C7";
                        badgeColor = "#B45309";
                      } else if (isReject) {
                        bubbleBg = "#FEF2F2";
                        bubbleBorder = "#FCA5A5";
                        bubbleColor = "#991B1B";
                        actLabel = "Rejected";
                        badgeBg = "#FEE2E2";
                        badgeColor = "#B91C1C";
                      } else if (h.act === "Submitted") {
                        bubbleBg = "#F0FDFA";
                        bubbleBorder = "#CCFBF1";
                        bubbleColor = "#115E59";
                        actLabel = "Submitted";
                        badgeBg = "#CCFBF1";
                        badgeColor = "#0D9488";
                      }

                      const borderRadius = isMe ? "12px 12px 0px 12px" : "12px 12px 12px 0px";

                      return (
                        <div key={i} style={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                          gap: 8,
                          alignItems: "flex-start",
                          width: "100%"
                        }}>
                          {!isMe && chatAvatar(h.by)}
                          
                          <div style={{
                            maxWidth: "75%",
                            minWidth: "120px",
                            background: bubbleBg,
                            border: `1.5px solid ${bubbleBorder}`,
                            borderRadius: borderRadius,
                            padding: "8px 12px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                            position: "relative"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: T.ink }}>
                                {isMe ? "You" : h.by}
                              </span>
                              <span style={{
                                fontSize: 8,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                background: badgeBg,
                                color: badgeColor,
                                padding: "1px 4px",
                                borderRadius: 3
                              }}>
                                {actLabel}
                              </span>
                            </div>
                            
                            <div style={{ fontSize: 12, color: bubbleColor, lineHeight: 1.4, wordBreak: "break-word" }}>
                              {h.note}
                            </div>
                            
                            <div style={{
                              fontSize: 9,
                              color: T.inkFaint || "#8696A0",
                              textAlign: "right",
                              marginTop: 4,
                              display: "block"
                            }}>
                              {h.date}
                            </div>
                          </div>

                          {isMe && chatAvatar(h.by)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Justification</div>
                {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                  <textarea
                    value={selectedRequest.justification || ""}
                    onChange={(e) => setSelectedRequest({ ...selectedRequest, justification: e.target.value })}
                    placeholder="Why is this job needed?"
                    style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }}
                  />
                ) : (
                  <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.justification || "—"}</div>
                )}
              </div>
            </div>

            {(selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back") && (
              <div style={{
                padding: "16px 24px",
                borderTop: `1px solid ${T.border}`,
                display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
                background: T.canvas, borderRadius: "0 0 16px 16px",
              }}>
                <Btn label="Cancel Request" variant="danger" small onClick={() => cancelJobRequest(selectedRequest.id)} />
                {!(selectedRequest.status === "Pending" && !hasChanges()) && (
                  <Btn
                    label={hasChanges() ? "Resubmit as New Request" : "Accept"}
                    variant="success"
                    small
                    onClick={handleAccept}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
