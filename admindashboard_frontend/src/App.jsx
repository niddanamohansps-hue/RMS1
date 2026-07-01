import { useState, useEffect } from "react";
import { T, font, radius, shadow, transition } from "./theme";
import { useBreakpoint } from "./hooks";
import { NAV } from "./data";
import { api } from "./lib/api";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import Dashboard from "./screens/Dashboard";
import ExistingRoles from "./screens/ExistingRoles";
import RoleRequests from "./screens/RoleRequests";
import JobRequests from "./screens/JobRequests";
import ApprovalRequests from "./screens/ApprovalRequests";
import JobPostings from "./screens/JobPostings";
import Applications from "./screens/Applications";
import InterviewPanel from "./screens/InterviewPanel";
import Panelist from "./screens/Panelist";
import Onboarding from "./screens/Onboarding";
import Auth from "./screens/Auth";
import ModuleSelector from "./screens/ModuleSelector";
import OfferManagement from "./screens/OfferManagement";

const loadSession = (key, fallback) => {
  try {
    // Try localStorage first (survives tab close), then sessionStorage as fallback
    const saved = localStorage.getItem(key) || sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveSession = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    sessionStorage.setItem(key, serialized);
  } catch { /* ignore */ }
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [roleRequests, _setRoleRequests] = useState([]);
  const [jobRequests, _setJobRequests] = useState([]);
  const [approvalRequests, _setApprovalRequests] = useState([]);
  const [existingRoles, _setExistingRoles] = useState([]);
  const [jobPostings, _setJobPostings] = useState([]);
  const [jobApplications, _setJobApplications] = useState([]);
  const [generalApplications, _setGeneralApplications] = useState([]);
  const [offers, _setOffers] = useState([]);
  const [interviews, _setInterviews] = useState([]);
  const [panelists, _setPanelists] = useState([]);
  const [selectedPanelists] = useState(["Dr. Roy", "Mr. Patel", "Ms. Nisha"]);
  
  const [currentUser, setCurrentUser] = useState(() =>
    loadSession("currentUser", null)
  );
  const [selectedModule, setSelectedModule] = useState(() => {
    const saved = loadSession("selectedModule", null);
    // If no saved module but we're on a dashboard/panelist path, infer it
    const path = window.location.pathname;
    if (!saved && (path.startsWith("/dashboard") || path.startsWith("/panelist"))) {
      return "Recruitment";
    }
    return saved;
  });

  // Translators
  const fromBackendRole = (r) => ({
    id: r.role_id,
    db_id: r.id,
    dept: r.department,
    role: r.role,
    type: r.type,
    headcount: r.headcount,
    filled: r.filled,
    currentFilled: r.filled,
    status: r.status,
    currentStatus: r.status,
    experience: r.experience || "—",
    salaryRange: r.salary_range || "—",
  });

  const toBackendRole = (r) => ({
    role_id: r.id,
    department: r.dept,
    role: r.role,
    type: r.type,
    headcount: r.headcount,
    filled: r.filled,
    status: r.status,
    experience: r.experience !== "—" ? r.experience : "",
    salary_range: r.salaryRange !== "—" ? r.salaryRange : "",
  });

  const fromBackendRoleRequest = (rr) => ({
    id: rr.request_id,
    db_id: rr.id,
    dept: rr.department,
    role: rr.role,
    just: rr.justification,
    salary: rr.salary_range || "",
    salaryRange: rr.salary_range || "",
    experience: rr.experience || "",
    status: rr.status,
    date: rr.date,
    history: rr.history || [],
  });

  // Valid statuses for RoleRequest / JobRequest in the backend
  const sanitizeRequestStatus = (status) => {
    const valid = ["Pending", "Approved", "Rejected", "Sent Back"];
    return valid.includes(status) ? status : "Pending";
  };

  const toBackendRoleRequest = (rr) => ({
    request_id: rr.id,
    department: rr.dept,
    role: rr.role,
    justification: rr.just || "",
    salary_range: rr.salaryRange || rr.salary || "",
    experience: rr.experience || "",
    status: sanitizeRequestStatus(rr.status),
    submitted_by: currentUser?.name || "HR Admin",
  });

  const fromBackendJobRequest = (jr) => ({
    id: jr.request_id,
    db_id: jr.id,
    role: jr.role,
    vacancies: jr.vacancies,
    vac: jr.vacancies,
    experience: jr.experience,
    exp: jr.experience,
    salary: jr.salary_range,
    sal: jr.salary_range,
    type: jr.type,
    qualification: jr.qualification,
    qual: jr.qualification,
    location: jr.location || "",
    description: jr.description || "",
    justification: jr.justification || "",
    educationalQualifications: jr.educational_qualifications || "",
    skillsRequired: jr.skills_required || "",
    status: jr.status,
    date: jr.created_at ? jr.created_at.substring(0, 10) : "",
    history: jr.history || [],
  });

  const toBackendJobRequest = (jr) => ({
    request_id: jr.id,
    role: jr.role,
    vacancies: jr.vacancies || jr.vac || 1,
    experience: jr.experience || jr.exp || "",
    salary_range: jr.salary || jr.sal || "",
    type: jr.type || "Full-time",
    qualification: jr.qualification || jr.qual || "",
    description: jr.description || "",
    justification: jr.justification || jr.just || "",
    location: jr.location || "",
    educational_qualifications: jr.educationalQualifications || "",
    skills_required: jr.skillsRequired || "",
    status: sanitizeRequestStatus(jr.status),
    submitted_by: currentUser?.name || "HR Admin",
  });

  const fromBackendApproval = (ap) => ({
    id: ap.request_id,
    db_id: ap.id,
    type: ap.type,
    title: ap.title,
    dept: ap.department,
    by: ap.submitted_by,
    date: ap.date,
    status: ap.status,
    // source_request_id = the linked RoleRequest/JobRequest's own request_id
    sourceId: ap.source_request_id || ap.request_id,
    source_db_id: ap.source_db_id || null,
    just: ap.justification || "",
    vacancies: ap.vacancies || 1,
    qual: ap.qualification || "",
    empType: ap.employment_type || "Full-time",
    experience: ap.experience || "",
    salary: ap.salary_range || "",
    role: ap.title,
    location: ap.location || "",
    description: ap.description || "",
    educationalQualifications: ap.educational_qualifications || "",
    skillsRequired: ap.skills_required || "",
    history: (ap.history || []).map(h => ({
      act: h.action,
      by: h.acted_by,
      date: h.date,
      note: h.note,
    })),
  });

  const fromBackendPosting = (jp) => ({
    id: jp.posting_id,
    db_id: jp.id,
    role: jp.role,
    status: jp.status,
    posted: jp.posted_date || "—",
    expiry: jp.expiry_date || "—",
    channel: jp.channel,
    apps: jp.application_count || 0,
    location: jp.location,
    salary: jp.salary_range,
    vacancies: jp.vacancies,
    exp: jp.experience,
    qual: jp.qualification,
    type: jp.type,
    description: jp.description,
    educationalQualifications: jp.educational_qualifications || "",
    skillsRequired: jp.skills_required || "",
  });

  const toBackendPosting = (jp) => {
    const sanitizeDate = (dateStr) => {
      if (!dateStr || dateStr === "—" || dateStr === "30 Days") return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split("T")[0];
        }
      } catch {}
      return new Date().toISOString().split("T")[0];
    };
    const sanitizeChannel = (channelStr) => {
      const valid = ["External", "Internal"];
      if (channelStr === "Career Page") return "External";
      return valid.includes(channelStr) ? channelStr : "External";
    };
    return {
      posting_id: jp.id,
      role: jp.role,
      status: jp.status,
      posted_date: sanitizeDate(jp.posted),
      expiry_date: sanitizeDate(jp.expiry),
      channel: sanitizeChannel(jp.channel),
      location: jp.location || "Guwahati, Assam",
      salary_range: jp.salary || "",
      vacancies: jp.vacancies || 1,
      experience: jp.exp || "",
      qualification: jp.qual || "",
      type: jp.type || "Full-time",
      description: jp.description || "",
      educational_qualifications: jp.educationalQualifications || "",
      skills_required: jp.skillsRequired || "",
    };
  };

  const fromBackendJobApp = (ja) => ({
    id: ja.app_id,
    db_id: ja.id,
    candidate_id: ja.candidate,
    name: ja.candidate_name,
    email: ja.candidate_email,
    phone: ja.candidate_phone,
    role: ja.role,
    posting_db_id: ja.posting || null,
    jobPostingId: ja.posting ? `JP-${ja.posting}` : "",
    exp: ja.experience,
    qualification: ja.qualification,
    applied: ja.applied_date,
    status: ja.status,
    referredBy: ja.referred_by || "None",
    admin_note: ja.admin_note || "",
    dept: ja.department || "",
  });

  const fromBackendGeneralApp = (ga) => ({
    id: ga.app_id,
    db_id: ga.id,
    name: ga.candidate_name,
    email: ga.candidate_email,
    phone: ga.candidate_phone,
    preferredRole: ga.preferred_role,
    preferredDept: ga.preferred_dept,
    exp: ga.experience,
    qualification: ga.qualification,
    applied: ga.applied_date,
    status: ga.status,
    admin_note: ga.admin_note || "",
  });

  const fromBackendInterview = (i) => ({
    id: i.interview_id,
    db_id: i.id,
    candidate: i.candidate_name,
    role: i.role,
    date: i.date,
    time: i.time,
    // panel_details has full objects {id, name, email}; panel has IDs only
    panel: (i.panel_details || i.panel || []).map(p => typeof p === 'object' ? p.name : p),
    panel_ids: (i.panel || []).map(p => typeof p === 'object' ? p.id : p),
    score: i.score || "",
    rec: i.recommendation || "",
    feedback: i.feedback || "",
    status: i.status,
    mode: i.mode,
    meetingLink: i.meeting_link,
    round: i.round,
  });

  const toBackendInterview = (i, panelIds) => ({
    interview_id: i.id,
    candidate_name: i.candidate,
    role: i.role,
    date: i.date,
    time: i.time,
    panel: panelIds || [],
    status: i.status,
    mode: i.mode,
    meeting_link: i.meetingLink || "",
    round: i.round || 1,
    score: i.score ? parseInt(i.score) : null,
    recommendation: i.rec || "",
    feedback: i.feedback || "",
  });

  const fromBackendOffer = (o) => ({
    id: o.offer_id || `OFR-${o.id}`,
    db_id: o.id,
    candidate: o.candidate_name,
    role: o.role,
    ctc: o.ctc,
    issued: o.issued_date,
    expiry: o.expiry_date,
    joining: o.joining_date || "",
    status: o.status,
  });

  const toBackendOffer = (o, candidateId) => ({
    offer_id: o.id,
    candidate: candidateId || 1,
    candidate_name: o.candidate,
    role: o.role,
    ctc: o.ctc,
    issued_date: o.issued,
    expiry_date: o.expiry,
    status: o.status,
  });

  // ── Targeted loaders — each fetches only what changed ──────────────────────
  const loadRoles = async () => {
    const d = await api.get("/roles/");
    _setExistingRoles(d.results ? d.results.map(fromBackendRole) : (Array.isArray(d) ? d.map(fromBackendRole) : []));
  };
  const loadRoleRequests = async () => {
    const d = await api.get("/role-requests/");
    _setRoleRequests(d.results ? d.results.map(fromBackendRoleRequest) : (Array.isArray(d) ? d.map(fromBackendRoleRequest) : []));
  };
  const loadJobRequests = async () => {
    const d = await api.get("/job-requests/");
    _setJobRequests(d.results ? d.results.map(fromBackendJobRequest) : (Array.isArray(d) ? d.map(fromBackendJobRequest) : []));
  };
  const loadApprovals = async () => {
    const d = await api.get("/approvals/");
    _setApprovalRequests(d.results ? d.results.map(fromBackendApproval) : (Array.isArray(d) ? d.map(fromBackendApproval) : []));
  };
  const loadJobPostings = async () => {
    const d = await api.get("/job-postings/");
    _setJobPostings(d.results ? d.results.map(fromBackendPosting) : (Array.isArray(d) ? d.map(fromBackendPosting) : []));
  };
  const loadApplications = async () => {
    const [appsData, genAppsData] = await Promise.all([
      api.get("/applications/"),
      api.get("/general-applications/"),
    ]);
    _setJobApplications(appsData.results ? appsData.results.map(fromBackendJobApp) : (Array.isArray(appsData) ? appsData.map(fromBackendJobApp) : []));
    _setGeneralApplications(genAppsData.results ? genAppsData.results.map(fromBackendGeneralApp) : (Array.isArray(genAppsData) ? genAppsData.map(fromBackendGeneralApp) : []));
  };
  const loadOffers = async () => {
    const d = await api.get("/offers/");
    _setOffers(d.results ? d.results.map(fromBackendOffer) : (Array.isArray(d) ? d.map(fromBackendOffer) : []));
  };
  const loadInterviews = async () => {
    const d = await api.get("/interviews/");
    _setInterviews(d.results ? d.results.map(fromBackendInterview) : (Array.isArray(d) ? d.map(fromBackendInterview) : []));
  };
  const loadPanelists = async () => {
    const d = await api.get("/panelists/");
    _setPanelists(d.results ? d.results : (Array.isArray(d) ? d : []));
  };

  // Full refresh (initial load only) — runs all in parallel where possible
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadRoles(),
        loadRoleRequests(),
        loadJobRequests(),
        loadApprovals(),
        loadJobPostings(),
        loadApplications(),
        loadOffers(),
        loadInterviews(),
        loadPanelists(),
      ]);
    } catch (err) {
      console.error("Failed to load initial backend data", err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  // Protected route redirects — only fire when auth state changes, NOT on every navigation
  useEffect(() => {
    if (!currentUser && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentUser && location.pathname === "/login") {
      navigate("/modules", { replace: true });
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to /modules only when selectedModule is truly missing (not just loading)
  useEffect(() => {
    if (
      currentUser &&
      !selectedModule &&
      !location.pathname.startsWith("/dashboard") &&
      !location.pathname.startsWith("/panelist") &&
      location.pathname !== "/modules" &&
      location.pathname !== "/login"
    ) {
      navigate("/modules", { replace: true });
    }
  }, [currentUser, selectedModule]); // eslint-disable-line react-hooks/exhaustive-deps

  // State wrappers for backend persistence
  const setExistingRoles = async (updateArg) => {
    const current = existingRoles;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    
    if (next.length < current.length) {
      const deleted = current.find(c => !next.some(n => n.id === c.id));
      if (deleted && deleted.db_id) {
        try {
          await api.delete(`/roles/${deleted.db_id}/`);
        } catch (err) { alert("Delete failed: " + err.message); }
      }
    } else if (next.length > current.length) {
      const added = next.find(n => !current.some(c => c.id === n.id));
      if (added) {
        try {
          await api.post("/roles/", toBackendRole(added));
        } catch (err) { alert("Create failed: " + err.message); }
      }
    } else {
      for (const n of next) {
        const c = current.find(x => x.id === n.id);
        if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
          try {
            await api.put(`/roles/${c.db_id}/`, toBackendRole(n));
          } catch (err) { alert("Update failed: " + err.message); }
        }
      }
    }
    // Refresh only roles after create/update/delete
    await loadRoles();
  };

  const setRoleRequests = async (updateArg) => {
    const current = roleRequests;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    if (next.length > current.length) {
      const added = next.find(n => !current.some(c => c.id === n.id));
      if (added) {
        try {
          await api.post("/role-requests/", toBackendRoleRequest(added));
        } catch (err) { alert("Create request failed: " + err.message); }
      }
    } else if (next.length < current.length) {
      const deleted = current.find(c => !next.some(n => n.id === c.id));
      if (deleted && deleted.db_id) {
        try {
          await api.delete(`/role-requests/${deleted.db_id}/`);
        } catch (err) { alert("Delete failed: " + err.message); }
      }
    } else {
      for (const n of next) {
        const c = current.find(x => x.id === n.id);
        if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
          try {
            await api.put(`/role-requests/${c.db_id}/`, toBackendRoleRequest(n));
          } catch (err) { alert("Update failed: " + err.message); }
        }
      }
    }
    // After role request changes, also refresh approvals (they may have linked records)
    await Promise.all([loadRoleRequests(), loadApprovals()]);
  };

  const setJobRequests = async (updateArg) => {
    const current = jobRequests;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    if (next.length > current.length) {
      const added = next.find(n => !current.some(c => c.id === n.id));
      if (added) {
        try {
          await api.post("/job-requests/", toBackendJobRequest(added));
        } catch (err) { alert("Create request failed: " + err.message); }
      }
    } else if (next.length < current.length) {
      const deleted = current.find(c => !next.some(n => n.id === c.id));
      if (deleted && deleted.db_id) {
        try {
          await api.delete(`/job-requests/${deleted.db_id}/`);
        } catch (err) { alert("Delete failed: " + err.message); }
      }
    } else {
      for (const n of next) {
        const c = current.find(x => x.id === n.id);
        if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
          try {
            await api.put(`/job-requests/${c.db_id}/`, toBackendJobRequest(n));
          } catch (err) { alert("Update failed: " + err.message); }
        }
      }
    }
    await Promise.all([loadJobRequests(), loadApprovals()]);
  };

  const setApprovalRequests = async (updateArg) => {
    const current = approvalRequests;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    // Backend ApprovalActionSerializer expects verb form: "Approve", "Reject", "Send Back"
    const actionVerbMap = {
      "Approved":  "Approve",
      "Rejected":  "Reject",
      "Sent Back": "Send Back",
    };
    for (const n of next) {
      const c = current.find(x => x.id === n.id);
      if (c && c.status !== n.status && c.db_id) {
        if (n.status === "Pending") {
          try {
            await api.patch(`/approvals/${c.db_id}/`, { status: "Pending" });
          } catch (err) { alert("Resubmit failed: " + err.message); }
        } else {
          const actionVerb = actionVerbMap[n.status];
          if (!actionVerb) continue; // unknown status, skip
          try {
            await api.post(`/approvals/${c.db_id}/action/`, {
              action: actionVerb,
              note: n.comment || "",
              acted_by: currentUser?.name || "HR Admin",
            });
          } catch (err) { alert("Action failed: " + err.message); }
        }
      }
    }
    // Approval action affects approvals + the linked source request
    await Promise.all([loadApprovals(), loadRoleRequests(), loadJobRequests()]);
  };

  const setJobPostings = async (updateArg) => {
    const current = jobPostings;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    
    if (next.length > current.length) {
      const added = next.find(n => !current.some(c => c.id === n.id));
      if (added) {
        try {
          await api.post("/job-postings/", toBackendPosting(added));
        } catch (err) { alert("Create posting failed: " + err.message); }
      }
    } else if (next.length < current.length) {
      const deleted = current.find(c => !next.some(n => n.id === c.id));
      if (deleted && deleted.db_id) {
        try {
          await api.delete(`/job-postings/${deleted.db_id}/`);
        } catch (err) { alert("Delete failed: " + err.message); }
      }
    } else {
      for (const n of next) {
        const c = current.find(x => x.id === n.id);
        if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
          try {
            if (c.status !== n.status) {
              if (n.status === "Published") {
                await api.post(`/job-postings/${c.db_id}/publish/`);
              } else if (n.status === "Unpublished") {
                await api.post(`/job-postings/${c.db_id}/unpublish/`);
              } else {
                await api.put(`/job-postings/${c.db_id}/`, toBackendPosting(n));
              }
            } else {
              await api.put(`/job-postings/${c.db_id}/`, toBackendPosting(n));
            }
          } catch (err) { alert("Update posting failed: " + err.message); }
        }
      }
    }
    await loadJobPostings();
  };

  const setJobApplications = async (updateArg) => {
    const current = jobApplications;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    for (const n of next) {
      const c = current.find(x => x.id === n.id);
      if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
        try {
          if (c.status !== n.status || c.admin_note !== n.admin_note) {
            await api.patch(`/applications/${c.db_id}/update_status/`, {
              status: n.status,
              admin_note: n.admin_note || "",
            });
          }
        } catch (err) { alert("Update status failed: " + err.message); }
      }
    }
    await loadApplications();
  };

  const setGeneralApplications = async (updateArg) => {
    const current = generalApplications;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    for (const n of next) {
      const c = current.find(x => x.id === n.id);
      if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
        try {
          await api.patch(`/general-applications/${c.db_id}/`, {
            status: n.status,
            admin_note: n.admin_note || "",
          });
        } catch (err) { alert("Update failed: " + err.message); }
      }
    }
    await loadApplications();
  };

  const setInterviews = async (updateArg) => {
    const current = interviews;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    if (next.length > current.length) {
      const added = next.find(n => !current.some(c => c.id === n.id));
      if (added) {
        try {
          const panelIds = (added.panel || []).map(name => {
            const p = panelists.find(px => px.name === name);
            return p ? p.id : null;
          }).filter(id => id !== null);

          const matchedApp = jobApplications.find(a => a.name === added.candidate);
          const payload = toBackendInterview(added, panelIds);
          if (matchedApp && matchedApp.db_id) {
            payload.application = matchedApp.db_id;
          }
          await api.post("/interviews/", payload);
        } catch (err) { alert("Schedule interview failed: " + err.message); }
      }
    } else if (next.length < current.length) {
      const deleted = current.find(c => !next.some(n => n.id === c.id));
      if (deleted && deleted.db_id) {
        try {
          await api.delete(`/interviews/${deleted.db_id}/`);
        } catch (err) { alert("Delete failed: " + err.message); }
      }
    } else {
      for (const n of next) {
        const c = current.find(x => x.id === n.id);
        if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
          try {
            const panelIds = (n.panel || []).map(name => {
              const p = panelists.find(px => px.name === name);
              return p ? p.id : null;
            }).filter(id => id !== null);
            await api.put(`/interviews/${c.db_id}/`, toBackendInterview(n, panelIds));
          } catch (err) { alert("Update failed: " + err.message); }
        }
      }
    }
    await loadInterviews();
  };

  const setOffers = async (updateArg) => {
    const current = offers;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    
    if (next.length > current.length) {
      const added = next.find(n => !current.some(c => c.id === n.id));
      if (added) {
        try {
          const matchedApp = jobApplications.find(a => a.name === added.candidate);
          const candidateId = matchedApp ? matchedApp.candidate_id : null;
          if (candidateId) {
            await api.post("/offers/", toBackendOffer(added, candidateId));
          } else {
            console.error("Could not find candidate application for offer creation");
          }
        } catch (err) { alert("Issue offer failed: " + err.message); }
      }
    } else if (next.length < current.length) {
      const deleted = current.find(c => !next.some(n => n.id === c.id));
      if (deleted && deleted.db_id) {
        try {
          await api.delete(`/offers/${deleted.db_id}/`);
        } catch (err) { alert("Delete failed: " + err.message); }
      }
    } else {
      for (const n of next) {
        const c = current.find(x => x.id === n.id);
        if (c && JSON.stringify(c) !== JSON.stringify(n) && c.db_id) {
          try {
            const matchedApp = jobApplications.find(a => a.name === n.candidate);
            const candidateId = matchedApp ? matchedApp.candidate_id : null;
            await api.put(`/offers/${c.db_id}/`, toBackendOffer(n, candidateId));
          } catch (err) { alert("Update failed: " + err.message); }
        }
      }
    }
    await loadOffers();
  };

  const setPanelists = async (updateArg) => {
    const current = panelists;
    let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
    
    if (next.length > current.length) {
      const added = next.find(n => !current.some(c => c.email === n.email));
      if (added) {
        try {
          await api.post("/panelists/", added);
        } catch (err) { alert("Add panelist failed: " + err.message); }
      }
    } else if (next.length < current.length) {
      const deleted = current.find(c => !next.some(n => n.email === c.email));
      if (deleted && deleted.id) {
        try {
          await api.delete(`/panelists/${deleted.id}/`);
        } catch (err) { alert("Delete failed: " + err.message); }
      }
    } else {
      for (const n of next) {
        const c = current.find(x => x.email === n.email);
        if (c && JSON.stringify(c) !== JSON.stringify(n) && c.id) {
          try {
            await api.put(`/panelists/${c.id}/`, n);
          } catch (err) { alert("Update failed: " + err.message); }
        }
      }
    }
    await loadPanelists();
  };

  useEffect(() => { saveSession("currentUser", currentUser); }, [currentUser]);
  useEffect(() => { saveSession("selectedModule", selectedModule); }, [selectedModule]);

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isCompact = isMobile || isTablet;

  const handleNav = (id) => {
    if (id === "panelist") {
      navigate("/panelist");
    } else {
      navigate(`/dashboard/${id}`);
    }
    if (isCompact) setSidebarOpen(false);
  };

  const pendingCount = approvalRequests.filter((r) => r.status === "Pending").length;

  const activeId = location.pathname.startsWith("/dashboard/")
    ? location.pathname.substring(11)
    : location.pathname.startsWith("/panelist")
      ? "panelist"
      : "";
  const pageLabel = NAV.find((n) => n.id === activeId)?.label || "";

  const handleGiveOffer = (candidate) => {
    const exists = offers.some((o) => o.candidate === candidate.name && o.role === candidate.role);
    if (!exists) {
      const newOffer = {
        id: `OFR-${Date.now()}`,
        candidate: candidate.name,
        role: candidate.role,
        ctc: "",
        issued: "",
        expiry: "",
        joining: "",
        status: "Draft",
      };
      setOffers((prev) => [...prev, newOffer]);
    }
    navigate("/dashboard/offer-management");
  };

  const SidebarContent = () => (
    <>
      {/* Logo & brand */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: radius.lg - 2,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: font.black, color: "#fff",
              boxShadow: shadow.accent,
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontSize: font.base, fontWeight: font.extrabold, fontFamily: font.heading, color: "#fff", letterSpacing: "-0.01em" }}>South Point</div>
            <div style={{ fontSize: font.xs, fontFamily: font.body, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>School · HR Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {NAV.filter((item) => {
          if (currentUser?.role !== "admin") {
            return item.id === "panelist";
          }
          return true;
        }).map((item, idx) => {
          const isActive = activeId === item.id;
          const itemPending = item.id === "approval-requests" ? pendingCount : 0;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 11, width: "100%",
                padding: "10px 14px", borderRadius: radius.md + 1, border: "none",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: "#fff",
                fontWeight: isActive ? font.bold : font.medium,
                fontSize: font.base,
                fontFamily: font.body,
                cursor: "pointer", textAlign: "left",
                marginBottom: 2,
                letterSpacing: "-0.01em",
                animationDelay: `${idx * 0.03}s`,
              }}
            >
              <span style={{
                fontSize: font.md,
                opacity: isActive ? 1 : 0.7,
                transition: transition.fast,
                transform: isActive ? "scale(1.15)" : "scale(1)",
                display: "inline-block",
              }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>

              {itemPending > 0 && (
                <span
                  style={{
                    background: T.accent,
                    color: T.primaryDark,
                    fontSize: 10,
                    fontWeight: font.black,
                    padding: "2px 6px",
                    borderRadius: radius.full,
                    minWidth: 16,
                    textAlign: "center",
                  }}
                  className="badge-pulse"
                >
                  {itemPending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & logout footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: radius.full,
              background: `linear-gradient(135deg, ${T.accentMid}, ${T.accent})`,
              color: T.primaryDark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: font.bold,
              fontSize: font.base,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {currentUser?.name ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "HR"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: font.base, fontWeight: font.bold, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentUser?.name || "HR Admin"}
            </div>
            <div style={{ fontSize: font.xs, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentUser?.email || "hr@southpoint.edu"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              setCurrentUser(null);
              setSelectedModule(null);
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("currentUser");
              localStorage.removeItem("selectedModule");
              sessionStorage.removeItem("currentUser");
              sessionStorage.removeItem("selectedModule");
              navigate("/login");
            }}
            title="Log Out"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: radius.md,
              padding: "4px 8px",
              cursor: "pointer",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              fontFamily: font.body,
              transition: "background 0.2s",
            }}
            className="btn-hover"
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Auth onLoginSuccess={(user) => { setCurrentUser(user); navigate("/modules"); }} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!selectedModule) {
    return (
      <ModuleSelector
        currentUser={currentUser}
        onSelectModule={(mod) => {
          setSelectedModule(mod);
          if (currentUser.role === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/panelist");
          }
        }}
        onLogout={() => {
          setCurrentUser(null);
          setSelectedModule(null);
          navigate("/login");
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: T.canvas, fontFamily: font.body }}>
      {/* Desktop sidebar */}
      {!isCompact && (
        <div style={{
          width: 240,
          background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
          display: "flex", flexDirection: "column", flexShrink: 0,
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        }}>
          <SidebarContent />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isCompact && sidebarOpen && (
        <>
          <div
            className="modal-backdrop"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="sidebar-slide-in"
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0, width: 270,
              background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
              display: "flex", flexDirection: "column", zIndex: 201,
              boxShadow: "8px 0 32px rgba(0,0,0,0.25)",
            }}
          >
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryMid} 100%)`,
            borderBottom: `2px solid ${T.accent}`,
            padding: "0 24px", height: 60, display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {/* Left: hamburger (mobile) + school branding */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16 }}>
            {isCompact && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn-hover"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: radius.md,
                  cursor: "pointer", padding: "6px 8px",
                  color: T.canvas, fontSize: 18, lineHeight: 1,
                  transition: transition.fast,
                }}
              >
                ☰
              </button>
            )}
            <img
              src="/images-removebg-preview.png"
              alt="South Point School Logo"
              style={{ height: isMobile ? 36 : 44, width: "auto", objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{
                fontSize: isMobile ? font.base : font.lg,
                fontWeight: font.extrabold,
                fontFamily: font.heading,
                color: T.accent,
                letterSpacing: "-0.01em", lineHeight: 1.2,
              }}>
                South Point School
              </div>
              <div style={{
                fontSize: isMobile ? 9 : font.xs,
                fontWeight: font.semibold,
                fontFamily: font.body,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.3, marginTop: 1,
              }}>
                Guwahati, Assam
              </div>
            </div>
          </div>

          {/* Right: page label + pending */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!isMobile && (
              <span style={{
                fontSize: font.base, fontWeight: font.semibold, fontFamily: font.body,
                color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em",
              }}>
                {pageLabel}
              </span>
            )}
            {pendingCount > 0 && (
              <button
                onClick={() => handleNav("approval-requests")}
                className="btn-hover badge-pulse"
                style={{
                  background: "rgba(201,168,76,0.15)",
                  border: `1px solid rgba(201,168,76,0.4)`,
                  borderRadius: radius.full, padding: "5px 14px",
                  fontSize: font.sm, fontWeight: font.bold,
                  fontFamily: font.body,
                  color: T.accent,
                  cursor: "pointer",
                  transition: transition.fast,
                }}
              >
                {pendingCount} Pending
              </button>
            )}
            <button
              onClick={() => {
                setSelectedModule(null);
                navigate("/modules");
              }}
              className="btn-hover"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                borderRadius: radius.md,
                padding: "6px 14px",
                cursor: "pointer",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                transition: transition.fast,
                fontFamily: font.body,
              }}
            >
              Back to Modules
            </button>
          </div>
        </div>

        {/* Page content */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px" : "28px 32px", position: "relative" }}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 50,
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(3px)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 14,
            }}>
              <div style={{
                width: 44, height: 44,
                border: `4px solid ${T.border}`,
                borderTop: `4px solid ${T.primary}`,
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
              }} />
              <div style={{
                fontSize: 13, fontWeight: 700,
                fontFamily: font.body,
                color: T.inkMid,
                letterSpacing: "-0.01em",
              }}>Loading data…</div>
            </div>
          )}
          <Routes>
            <Route path="/dashboard" element={<Dashboard approvalRequests={approvalRequests} />} />
            <Route path="/dashboard/existing-roles" element={<ExistingRoles roles={existingRoles} setRoles={setExistingRoles} />} />
            <Route path="/dashboard/role-requests" element={
              <RoleRequests
                roleRequests={roleRequests}
                setRoleRequests={setRoleRequests}
                setApprovalRequests={setApprovalRequests}
                existingRoles={existingRoles}
                setExistingRoles={setExistingRoles}
                onNavigateToExistingRoles={() => navigate("/dashboard/existing-roles")}
              />
            } />
            <Route path="/dashboard/job-requests" element={
              <JobRequests
                jobRequests={jobRequests}
                setJobRequests={setJobRequests}
                approvalRequests={approvalRequests}
                setApprovalRequests={setApprovalRequests}
                jobPostings={jobPostings}
                setJobPostings={setJobPostings}
                existingRoles={existingRoles}
                onNavigateToApplications={() => navigate("/dashboard/applications")}
              />
            } />
            <Route path="/dashboard/approval-requests" element={
              <ApprovalRequests
                requests={approvalRequests}
                setRequests={setApprovalRequests}
                existingRoles={existingRoles}
                setExistingRoles={setExistingRoles}
                jobPostings={jobPostings}
                setJobPostings={setJobPostings}
                setRoleRequests={setRoleRequests}
                setJobRequests={setJobRequests}
                onNavigateToApplications={() => navigate("/dashboard/applications")}
                onNavigateToExistingRoles={() => navigate("/dashboard/existing-roles")}
              />
            } />
            <Route path="/dashboard/job-postings" element={
              <JobPostings
                postings={jobPostings}
                setPostings={setJobPostings}
                jobRequests={jobRequests}
                existingRoles={existingRoles}
              />
            } />
            <Route path="/dashboard/applications" element={
              <Applications
                jobApplications={jobApplications}
                setJobApplications={setJobApplications}
                generalApplications={generalApplications}
                setGeneralApplications={setGeneralApplications}
                jobPostings={jobPostings}
                jobRequests={jobRequests}
              />
            } />
            <Route path="/dashboard/interview-panel" element={
              <InterviewPanel
                jobApplications={jobApplications}
                generalApplications={generalApplications}
                jobPostings={jobPostings}
                interviews={interviews}
                setInterviews={setInterviews}
                panelists={panelists}
                setPanelists={setPanelists}
                onGiveOffer={handleGiveOffer}
              />
            } />
            <Route path="/dashboard/offer-management" element={
              <OfferManagement offers={offers} setOffers={setOffers} jobPostings={jobPostings} />
            } />
            <Route path="/dashboard/onboarding" element={
              <Onboarding jobPostings={jobPostings} offers={offers} />
            } />
            <Route path="/panelist" element={
              <Panelist
                interviews={interviews}
                setInterviews={setInterviews}
                jobPostings={jobPostings}
                currentUser={currentUser?.role || "admin"}
              />
            } />
            <Route path="*" element={<Navigate to={currentUser?.role === "admin" ? "/dashboard" : "/panelist"} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
