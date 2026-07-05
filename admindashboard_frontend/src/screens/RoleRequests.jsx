import { useState, useRef } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Btn, Input, Badge, FormField, Modal, ModalHeader, Textarea } from "../components/ui";

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
  dept: "",
  role: "",
  minExperience: "",
  maxExperience: "",
  minSalary: "",
  maxSalary: "",
  just: "",
  date: new Date().toLocaleDateString(),
  status: "Pending",
  comment: "",
});

export default function RoleRequests({ roleRequests, setRoleRequests, setApprovalRequests, setExistingRoles, onNavigateToExistingRoles }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [showForm, setShowForm] = useState(false);
  const [roleForms, setRoleForms] = useState([emptyForm()]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [originalRequest, setOriginalRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef(null);

  const statuses = ["All", "Pending", "Approved", "Rejected", "Cancelled", "Sent Back"];

  const filteredRequests = roleRequests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => {
      const query = search.toLowerCase();
      return (
        (r.role || "").toLowerCase().includes(query) ||
        (r.dept || "").toLowerCase().includes(query) ||
        (String(r.id) || "").toLowerCase().includes(query)
      );
    });

  const counts = statuses.reduce((acc, status) => {
    acc[status] = status === "All"
      ? roleRequests.length
      : roleRequests.filter((r) => r.status === status).length;
    return acc;
  }, {});

  const updateForm = (index, key, value) => {
    setRoleForms((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    setFormErrors((prev) => {
      const updated = { ...prev };
      if (updated[index]) {
        const fieldErrors = { ...updated[index] };
        delete fieldErrors[key];
        updated[index] = fieldErrors;
      }
      return updated;
    });
  };

  const parseSalary = (val) => parseFloat(val.replace(/,/g, "")) || 0;

  const validateForms = () => {
    const errors = {};
    let valid = true;
    roleForms.forEach((f, i) => {
      const errs = {};
      const minExp = parseFloat(f.minExperience);
      const maxExp = parseFloat(f.maxExperience);

      if (f.minExperience && isNaN(minExp)) {
        errs.minExperience = "Must be a number";
        valid = false;
      }
      if (f.maxExperience && isNaN(maxExp)) {
        errs.maxExperience = "Must be a number";
        valid = false;
      }
      if (f.minExperience && f.maxExperience && !isNaN(minExp) && !isNaN(maxExp) && minExp >= maxExp) {
        errs.minExperience = "Min experience must be less than max experience";
        valid = false;
      }

      const parsedMinSal = parseFloat(f.minSalary.replace(/,/g, ""));
      const parsedMaxSal = parseFloat(f.maxSalary.replace(/,/g, ""));
      if (f.minSalary && isNaN(parsedMinSal)) {
        errs.minSalary = "Must be a number";
        valid = false;
      }
      if (f.maxSalary && isNaN(parsedMaxSal)) {
        errs.maxSalary = "Must be a number";
        valid = false;
      }
      const minSal = parseSalary(f.minSalary);
      const maxSal = parseSalary(f.maxSalary);
      if (f.minSalary && f.maxSalary && minSal > 0 && maxSal > 0 && minSal >= maxSal) {
        errs.minSalary = "Min salary must be less than max salary";
        valid = false;
      }
      if (Object.keys(errs).length > 0) errors[i] = errs;
    });
    setFormErrors(errors);
    return valid;
  };

  const removeForm = (index) => {
    setRoleForms((prev) => prev.filter((_, i) => i !== index));
  };

  const openNew = () => {
    setEditingId(null);
    setRoleForms([emptyForm()]);
    setShowForm(true);
  };

  const submitRequests = () => {
    if (!validateForms()) return;
    const updatedForms = roleForms.map((f) => {
      const combinedSalary = f.minSalary && f.maxSalary ? `${f.minSalary}-${f.maxSalary}` : (f.minSalary || f.maxSalary || "");
      const combinedExperience = f.minExperience && f.maxExperience ? `${f.minExperience}-${f.maxExperience}` : (f.minExperience || f.maxExperience || "");
      return {
        ...f,
        salaryRange: combinedSalary,
        experience: combinedExperience,
      };
    });

    if (editingId !== null) {
      setRoleRequests((prev) => prev.map((r) => r.id === editingId ? { ...r, ...updatedForms[0] } : r));
    } else {
      const newRequests = updatedForms.map((f, i) => ({
        ...f,
        id: `RR-${Date.now()}-${i}`,
        requestType: "Role",
        history: [{ act: "Submitted", by: "Current User", date: f.date || new Date().toLocaleDateString(), note: "" }],
      }));
      setRoleRequests((prev) => [...prev, ...newRequests]);
    }
    setRoleForms([emptyForm()]);
    setShowForm(false);
    setEditingId(null);
  };

  const saveRoleRequestEdits = (submitAsPending) => {
    if (!selectedRequest) return;
    const minS = selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0]?.trim() ?? "";
    const maxS = selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1]?.trim() ?? "";
    const minE = selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0]?.trim() ?? "";
    const maxE = selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1]?.trim() ?? "";

    const combinedSalary = minS && maxS ? `${minS}-${maxS}` : (minS || maxS || "");
    const combinedExperience = minE && maxE ? `${minE}-${maxE}` : (minE || maxE || "");

    const updated = {
      ...selectedRequest,
      salaryRange: combinedSalary,
      experience: combinedExperience,
      status: submitAsPending ? "Pending" : selectedRequest.status,
    };

    delete updated.minSalary;
    delete updated.maxSalary;
    delete updated.minExperience;
    delete updated.maxExperience;

    setRoleRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));

    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const hasChanges = () => {
    if (!selectedRequest || !originalRequest) return false;
    const currMinSal = selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0]?.trim() ?? "";
    const currMaxSal = selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1]?.trim() ?? "";
    const currMinExp = selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0]?.trim() ?? "";
    const currMaxExp = selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1]?.trim() ?? "";
    const origMinSal = originalRequest.salaryRange?.split("-")[0]?.trim() ?? "";
    const origMaxSal = originalRequest.salaryRange?.split("-")[1]?.trim() ?? "";
    const origMinExp = originalRequest.experience?.split("-")[0]?.trim() ?? "";
    const origMaxExp = originalRequest.experience?.split("-")[1]?.trim() ?? "";
    return (
      selectedRequest.dept !== originalRequest.dept ||
      selectedRequest.role !== originalRequest.role ||
      selectedRequest.just !== originalRequest.just ||
      currMinSal !== origMinSal ||
      currMaxSal !== origMaxSal ||
      currMinExp !== origMinExp ||
      currMaxExp !== origMaxExp
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
    delete updated.minSalary;
    delete updated.maxSalary;
    delete updated.minExperience;
    delete updated.maxExperience;

    setRoleRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));

    if (setExistingRoles) {
      setExistingRoles((prev) => {
        const exists = prev.some((x) => x.role === selectedRequest.role && x.dept === selectedRequest.dept);
        if (exists) return prev;
        const cleanedSalary = selectedRequest.salaryRange ? selectedRequest.salaryRange.replace(/^₹/, "") : "";
        return [...prev, {
          id: `ROL-${Date.now()}`, dept: selectedRequest.dept, role: selectedRequest.role, type: "Full-time",
          headcount: 1, filled: 0, currentFilled: 0, status: "Inactive", currentStatus: "Inactive",
          experience: selectedRequest.experience || "—",
          salaryRange: cleanedSalary || "—",
        }];
      });
    }

    if (onNavigateToExistingRoles) {
      setTimeout(() => { onNavigateToExistingRoles(); }, 300);
    }

    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };

  const handleAccept = () => {
    if (hasChanges()) {
      saveRoleRequestEdits(true);
    } else {
      approveDirectly();
    }
  };

  const cancelRoleRequest = (reqId) => {
    setRoleRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "Cancelled" } : r))
    );
    setShowViewModal(false);
    setSelectedRequest(null);
    setOriginalRequest(null);
  };
  return (
    <div>
      <SectionTitle
        title="Role Requests"
        sub="Raise role requests before creating job requests"
        action={<Btn label="+ New Role Request" onClick={openNew} />}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Input
          placeholder="Search requests by role, department, or ID..."
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

      {roleRequests.filter((r) => r.status === "Sent Back").map((r) => (
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
              Request for <strong>{r.role}</strong> was returned
              {(r.comment || (r.history && r.history.length > 0 && r.history[r.history.length - 1]?.note)) && (
                <> with comment: <em>&ldquo;{r.comment || r.history[r.history.length - 1].note}&rdquo;</em></>
              )}
            </span>
          </div>
          <Btn label="View Request" small variant="amber" onClick={() => { setSelectedRequest(r); setOriginalRequest(r); setShowViewModal(true); }} />
        </div>
      ))}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); setRoleForms([emptyForm()]); }} maxWidth={620}>
        <ModalHeader title={editingId ? "Edit Role Request" : "New Role Request"} onClose={() => { setShowForm(false); setEditingId(null); setRoleForms([emptyForm()]); }} />

        <div style={{
          background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
          margin: isMobile ? "-16px -16px 20px -16px" : "-24px -24px 20px -24px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>
            📂
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {editingId ? "Modify Role Request Details" : "Raise New Headcount Request"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              Provide job details and salary specifications to start the approval workflow.
            </div>
          </div>
        </div>

        <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: 4, margin: "0 -4px" }}>
          {roleForms.map((form, index) => (
            <Card key={form.id} hover={false} style={{ padding: 18, marginBottom: 16, border: `1px solid ${T.border}`, background: T.canvas }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>
                  {editingId ? "Role Details" : `Role Request #${index + 1}`}
                </div>
                {roleForms.length > 1 && (
                  <button onClick={() => removeForm(index)} style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormField label="Department" required>
                  <Input placeholder="Enter department" value={form.dept} onChange={(e) => updateForm(index, "dept", e.target.value)} />
                </FormField>
                <FormField label="Role Name" required>
                  <Input placeholder="Enter role" value={form.role} onChange={(e) => updateForm(index, "role", e.target.value)} />
                </FormField>
                <FormField label="Min Experience (Yrs)" required>
                  <Input
                    placeholder="e.g. 2"
                    value={form.minExperience}
                    onChange={(e) => updateForm(index, "minExperience", e.target.value)}
                    style={formErrors[index]?.minExperience ? { borderColor: T.red } : {}}
                  />
                  {formErrors[index]?.minExperience && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      {formErrors[index].minExperience}
                    </div>
                  )}
                </FormField>
                <FormField label="Max Experience (Yrs)" required>
                  <Input
                    placeholder="e.g. 5"
                    value={form.maxExperience}
                    onChange={(e) => updateForm(index, "maxExperience", e.target.value)}
                    style={formErrors[index]?.maxExperience ? { borderColor: T.red } : {}}
                  />
                  {formErrors[index]?.maxExperience && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      {formErrors[index].maxExperience}
                    </div>
                  )}
                </FormField>
                <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                  <FormField label="Salary Range (₹ / Month)" required>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <span style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: T.inkLight,
                          fontWeight: 600,
                          fontSize: 14,
                          pointerEvents: "none"
                        }}>₹</span>
                        <Input
                          placeholder="Min (e.g. 40,000)"
                          value={form.minSalary}
                          onChange={(e) => updateForm(index, "minSalary", e.target.value)}
                          style={{
                            paddingLeft: 24,
                            ...(formErrors[index]?.minSalary ? { borderColor: T.red } : {})
                          }}
                        />
                      </div>
                      <span style={{ color: T.inkLight, fontWeight: 500, fontSize: 13 }}>to</span>
                      <div style={{ position: "relative", flex: 1 }}>
                        <span style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: T.inkLight,
                          fontWeight: 600,
                          fontSize: 14,
                          pointerEvents: "none"
                        }}>₹</span>
                        <Input
                          placeholder="Max (e.g. 60,000)"
                          value={form.maxSalary}
                          onChange={(e) => updateForm(index, "maxSalary", e.target.value)}
                          style={{
                            paddingLeft: 24,
                            ...(formErrors[index]?.maxSalary ? { borderColor: T.red } : {})
                          }}
                        />
                      </div>
                    </div>
                    {(formErrors[index]?.minSalary || formErrors[index]?.maxSalary) && (
                      <div style={{ color: T.red, fontSize: 11, marginTop: 6, fontWeight: 600 }}>
                        {formErrors[index].minSalary || formErrors[index].maxSalary}
                      </div>
                    )}
                  </FormField>
                </div>
              </div>
              <FormField label="Justification" required>
                <Textarea
                  value={form.just}
                  onChange={(e) => updateForm(index, "just", e.target.value)}
                  placeholder="Why is this role needed?"
                  rows={3}
                />
              </FormField>
            </Card>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setRoleForms((p) => [...p, emptyForm()])} style={{ marginRight: "auto" }} />}
          <Btn label="Cancel" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setRoleForms([emptyForm()]); }} />
          <Btn label="Submit Request" onClick={submitRequests} />
        </div>
      </Modal>

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
                  onClick={() => { setSelectedRequest(r); setOriginalRequest(r); setShowViewModal(true); }}
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
                        📂
                      </div>
                      <div style={{ paddingRight: 64 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role || "—"}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                          {r.dept || "—"}
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
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Experience</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.experience ? `${r.experience} yrs` : "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Salary Range</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.salaryRange ? `₹${r.salaryRange}` : "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Date</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.date || "—"}</div>
                      </div>
                    </div>

                    {r.just && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Justification</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.just}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div />
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
            onRowClick={(index) => {
              setSelectedRequest(filteredRequests[index]);
              setOriginalRequest(filteredRequests[index]);
              setShowViewModal(true);
            }}
            cols={["Request ID", "Department", "Role", "Experience", "Salary Range", "Justification", "Date", "Status"]}
            rows={filteredRequests.map((r) => {
              const ss = getStatusStyle(r.status);
              return [
                <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
                r.dept || "—",
                <strong>{r.role || "—"}</strong>,
                r.experience ? `${r.experience} yrs` : "—",
                r.salaryRange ? `₹${r.salaryRange}` : "—",
                <span style={{ fontSize: 12, color: T.inkLight, maxWidth: 180, display: "inline-block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.just || "—"}</span>,
                r.date || "—",
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
              background: T.surface, borderRadius: 16, width: "100%", maxWidth: 540,
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
                  <Badge label="Role Request" variant="blue" />
                  <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
                  {selectedRequest.role || "Role Request Details"}
                </div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                  {selectedRequest.dept && selectedRequest.dept !== "N/A" ? `${selectedRequest.dept} · ` : ""}{selectedRequest.date}
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
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Department</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      value={selectedRequest.dept || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, dept: e.target.value })}
                      placeholder="Department"
                      style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.dept || "—"}</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role Name</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      value={selectedRequest.role || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, role: e.target.value })}
                      placeholder="Role Name"
                      style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{selectedRequest.role || "—"}</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Salary Range</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <span style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: T.inkLight,
                          fontWeight: 600,
                          fontSize: 13,
                          pointerEvents: "none"
                        }}>₹</span>
                        <input
                          value={selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, minSalary: e.target.value })}
                          placeholder="Min"
                          style={{
                            width: "100%",
                            padding: "9px 9px 9px 22px",
                            border: `1.5px solid ${T.border}`,
                            borderRadius: 8,
                            fontSize: 13,
                            outline: "none",
                            boxSizing: "border-box",
                            background: T.surface,
                            color: T.ink
                          }}
                        />
                      </div>
                      <span style={{ color: T.inkLight, fontSize: 12, fontWeight: 500 }}>to</span>
                      <div style={{ position: "relative", flex: 1 }}>
                        <span style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: T.inkLight,
                          fontWeight: 600,
                          fontSize: 13,
                          pointerEvents: "none"
                        }}>₹</span>
                        <input
                          value={selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, maxSalary: e.target.value })}
                          placeholder="Max"
                          style={{
                            width: "100%",
                            padding: "9px 9px 9px 22px",
                            border: `1.5px solid ${T.border}`,
                            borderRadius: 8,
                            fontSize: 13,
                            outline: "none",
                            boxSizing: "border-box",
                            background: T.surface,
                            color: T.ink
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>₹{selectedRequest.salaryRange || "—"}</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Experience</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Min (yrs)</div>
                        <input
                          value={selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, minExperience: e.target.value })}
                          placeholder="e.g. 2"
                          style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Max (yrs)</div>
                        <input
                          value={selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, maxExperience: e.target.value })}
                          placeholder="e.g. 5"
                          style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.experience ? `${selectedRequest.experience} yrs` : "—"}</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Justification</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <textarea
                      value={selectedRequest.just || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, just: e.target.value })}
                      placeholder="Why is this role needed?"
                      style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.just}</div>
                  )}
                </div>
              </div>

              {selectedRequest.history?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Activity History</div>
                  {selectedRequest.history.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === selectedRequest.history.length - 1 ? T.blue : T.border, marginTop: 3, flexShrink: 0 }} />
                        {i < selectedRequest.history.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, margin: "3px 0" }} />}
                      </div>
                      <div style={{ paddingBottom: i < selectedRequest.history.length - 1 ? 4 : 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>
                          {h.act} <span style={{ fontWeight: 400, color: T.inkLight }}>by {h.by}</span>
                        </div>
                        <div style={{ fontSize: 11, color: T.inkFaint }}>{h.date}</div>
                        {h.note && (
                          <div style={{ marginTop: 4, fontSize: 12, color: T.amber, background: T.amberLight, padding: "6px 10px", borderRadius: 7, border: `1px solid #FDE68A` }}>
                            {h.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back") && (
              <div style={{
                padding: "16px 24px",
                borderTop: `1px solid ${T.border}`,
                display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
                background: T.canvas, borderRadius: "0 0 16px 16px",
              }}>
                <Btn
                  label="Cancel Request"
                  variant="danger"
                  small
                  onClick={() => {
                    cancelRoleRequest(selectedRequest.id);
                  }}
                />
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
