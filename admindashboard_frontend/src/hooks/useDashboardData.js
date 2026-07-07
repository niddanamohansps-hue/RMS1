import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { T } from "../theme";
import {
  fromBackendRole,
  toBackendRole,
  fromBackendRoleRequest,
  toBackendRoleRequest,
  fromBackendJobRequest,
  toBackendJobRequest,
  fromBackendApproval,
  fromBackendPosting,
  toBackendPosting,
  fromBackendJobApp,
  fromBackendGeneralApp,
  fromBackendInterview,
  toBackendInterview,
  fromBackendOffer,
  toBackendOffer,
} from "../utils/translators";

export default function useDashboardData(currentUser, pathname, navigate) {
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

  const loadedOnce = useRef({
    roles: false,
    roleRequests: false,
    jobRequests: false,
    approvals: false,
    jobPostings: false,
    applications: false,
    offers: false,
    interviews: false,
    panelists: false,
  });

  // Loaders
  const loadRoles = async () => {
    const d = await api.get("/roles/");
    _setExistingRoles(d.results ? d.results.map(fromBackendRole) : (Array.isArray(d) ? d.map(fromBackendRole) : []));
    loadedOnce.current.roles = true;
  };
  const loadRoleRequests = async () => {
    const d = await api.get("/role-requests/");
    _setRoleRequests(d.results ? d.results.map(fromBackendRoleRequest) : (Array.isArray(d) ? d.map(fromBackendRoleRequest) : []));
    loadedOnce.current.roleRequests = true;
  };
  const loadJobRequests = async () => {
    const d = await api.get("/job-requests/");
    _setJobRequests(d.results ? d.results.map(fromBackendJobRequest) : (Array.isArray(d) ? d.map(fromBackendJobRequest) : []));
    loadedOnce.current.jobRequests = true;
  };
  const loadApprovals = async () => {
    const d = await api.get("/approvals/");
    _setApprovalRequests(d.results ? d.results.map(fromBackendApproval) : (Array.isArray(d) ? d.map(fromBackendApproval) : []));
    loadedOnce.current.approvals = true;
  };
  const loadJobPostings = async () => {
    const d = await api.get("/job-postings/");
    _setJobPostings(d.results ? d.results.map(fromBackendPosting) : (Array.isArray(d) ? d.map(fromBackendPosting) : []));
    loadedOnce.current.jobPostings = true;
  };
  const loadApplications = async () => {
    const [appsData, genAppsData] = await Promise.all([
      api.get("/applications/"),
      api.get("/general-applications/"),
    ]);
    _setJobApplications(appsData.results ? appsData.results.map(fromBackendJobApp) : (Array.isArray(appsData) ? appsData.map(fromBackendJobApp) : []));
    _setGeneralApplications(genAppsData.results ? genAppsData.results.map(fromBackendGeneralApp) : (Array.isArray(genAppsData) ? genAppsData.map(fromBackendGeneralApp) : []));
    loadedOnce.current.applications = true;
  };
  const loadOffers = async () => {
    const d = await api.get("/offers/");
    _setOffers(d.results ? d.results.map(fromBackendOffer) : (Array.isArray(d) ? d.map(fromBackendOffer) : []));
    loadedOnce.current.offers = true;
  };
  const loadInterviews = async () => {
    const d = await api.get("/interviews/");
    const backendItems = d.results ? d.results.map(fromBackendInterview) : (Array.isArray(d) ? d.map(fromBackendInterview) : []);
    _setInterviews((prev) => {
      return backendItems.map((item) => {
        const existing = prev.find((p) => p.id === item.id);
        return existing ? { ...item, attendance: existing.attendance } : item;
      });
    });
    loadedOnce.current.interviews = true;
  };
  const loadPanelists = async () => {
    const d = await api.get("/panelists/");
    _setPanelists(d.results ? d.results : (Array.isArray(d) ? d : []));
    loadedOnce.current.panelists = true;
  };

  // Dynamic Loader hook to sync screen-specific data
  useEffect(() => {
    if (!currentUser) return;

    const path = pathname;
    const loadRequiredData = async (isBackground = false) => {
      let needsSpinner = false;
      if (!isBackground) {
        if (path === "/dashboard") {
          // Dashboard uses approvals count
        } else if (path === "/dashboard/existing-roles") {
          needsSpinner = !loadedOnce.current.roles;
        } else if (path === "/dashboard/role-requests") {
          needsSpinner = !loadedOnce.current.roleRequests || !loadedOnce.current.roles;
        } else if (path === "/dashboard/job-requests") {
          needsSpinner = !loadedOnce.current.jobRequests || !loadedOnce.current.jobPostings || !loadedOnce.current.roles;
        } else if (path === "/dashboard/approval-requests") {
          needsSpinner = !loadedOnce.current.roles || !loadedOnce.current.jobPostings;
        } else if (path === "/dashboard/job-postings") {
          needsSpinner = !loadedOnce.current.jobPostings || !loadedOnce.current.jobRequests || !loadedOnce.current.roles;
        } else if (path === "/dashboard/applications") {
          needsSpinner = !loadedOnce.current.applications || !loadedOnce.current.jobPostings || !loadedOnce.current.jobRequests;
        } else if (path === "/dashboard/interview-panel") {
          needsSpinner = !loadedOnce.current.applications || !loadedOnce.current.jobPostings || !loadedOnce.current.interviews || !loadedOnce.current.panelists;
        } else if (path === "/dashboard/offer-management") {
          needsSpinner = !loadedOnce.current.offers || !loadedOnce.current.jobPostings;
        } else if (path === "/dashboard/onboarding") {
          needsSpinner = !loadedOnce.current.jobPostings || !loadedOnce.current.offers;
        } else if (path === "/panelist") {
          needsSpinner = !loadedOnce.current.interviews || !loadedOnce.current.jobPostings;
        }
      }

      if (needsSpinner) {
        setIsLoading(true);
      }

      loadApprovals().catch(() => {});

      try {
        const promises = [];

        if (path === "/dashboard") {
          // Dashboard approvals already loading
        } else if (path === "/dashboard/existing-roles") {
          if (isBackground || !loadedOnce.current.roles) promises.push(loadRoles());
        } else if (path === "/dashboard/role-requests") {
          if (isBackground || !loadedOnce.current.roleRequests) promises.push(loadRoleRequests());
          if (isBackground || !loadedOnce.current.roles) promises.push(loadRoles());
        } else if (path === "/dashboard/job-requests") {
          if (isBackground || !loadedOnce.current.jobRequests) promises.push(loadJobRequests());
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
          if (isBackground || !loadedOnce.current.roles) promises.push(loadRoles());
        } else if (path === "/dashboard/approval-requests") {
          if (isBackground || !loadedOnce.current.roles) promises.push(loadRoles());
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
        } else if (path === "/dashboard/job-postings") {
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
          if (isBackground || !loadedOnce.current.jobRequests) promises.push(loadJobRequests());
          if (isBackground || !loadedOnce.current.roles) promises.push(loadRoles());
        } else if (path === "/dashboard/applications") {
          if (isBackground || !loadedOnce.current.applications) promises.push(loadApplications());
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
          if (isBackground || !loadedOnce.current.jobRequests) promises.push(loadJobRequests());
        } else if (path === "/dashboard/interview-panel") {
          if (isBackground || !loadedOnce.current.applications) promises.push(loadApplications());
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
          if (isBackground || !loadedOnce.current.interviews) promises.push(loadInterviews());
          if (isBackground || !loadedOnce.current.panelists) promises.push(loadPanelists());
        } else if (path === "/dashboard/offer-management") {
          if (isBackground || !loadedOnce.current.offers) promises.push(loadOffers());
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
          if (isBackground || !loadedOnce.current.roles) promises.push(loadRoles());
          if (isBackground || !loadedOnce.current.interviews) promises.push(loadInterviews());
          if (isBackground || !loadedOnce.current.applications) promises.push(loadJobApplications());
        } else if (path === "/dashboard/onboarding") {
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
          if (isBackground || !loadedOnce.current.offers) promises.push(loadOffers());
        } else if (path === "/panelist") {
          if (isBackground || !loadedOnce.current.interviews) promises.push(loadInterviews());
          if (isBackground || !loadedOnce.current.jobPostings) promises.push(loadJobPostings());
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } catch (err) {
        console.error("Failed to load screen-specific backend data", err);
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    };

    loadRequiredData(false);

    const interval = setInterval(() => {
      loadRequiredData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [pathname, currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

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
    await loadRoles();
  };

  const setRoleRequests = async (updateArg) => {
    setIsLoading(true);
    try {
      const current = roleRequests;
      let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
      if (next.length > current.length) {
        const added = next.find(n => !current.some(c => c.id === n.id));
        if (added) {
          try {
            await api.post("/role-requests/", toBackendRoleRequest(added, currentUser));
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
              await api.put(`/role-requests/${c.db_id}/`, toBackendRoleRequest(n, currentUser));
            } catch (err) { alert("Update failed: " + err.message); }
          }
        }
      }
      await Promise.all([loadRoleRequests(), loadApprovals()]);
    } finally {
      setIsLoading(false);
    }
  };

  const setJobRequests = async (updateArg) => {
    setIsLoading(true);
    try {
      const current = jobRequests;
      let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
      if (next.length > current.length) {
        const added = next.find(n => !current.some(c => c.id === n.id));
        if (added) {
          try {
            await api.post("/job-requests/", toBackendJobRequest(added, currentUser));
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
              await api.put(`/job-requests/${c.db_id}/`, toBackendJobRequest(n, currentUser));
            } catch (err) { alert("Update failed: " + err.message); }
          }
        }
      }
      await Promise.all([loadJobRequests(), loadApprovals()]);
    } finally {
      setIsLoading(false);
    }
  };

  const setApprovalRequests = async (updateArg) => {
    setIsLoading(true);
    try {
      const current = approvalRequests;
      let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
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
            if (!actionVerb) continue;
            try {
              const payload = {
                action: actionVerb,
                note: n.comment || "",
                acted_by: currentUser?.name || "HR Admin",
              };
              if (n.type === "Role Request") {
                payload.department = n.dept || "";
                payload.role = n.role || "";
                payload.salary_range = n.salary ? n.salary.replace(/^₹/, "") : "";
                payload.experience = n.experience || "";
              } else if (n.type === "Job Request") {
                payload.department = n.dept || "";
                payload.role = n.role || "";
                payload.salary_range = n.salary || "";
                payload.experience = n.experience || "";
                payload.location = n.location || "";
                payload.category = n.category || "";
                payload.vacancies = n.vacancies || 1;
                payload.employment_type = n.empType || "";
                payload.description = n.description || "";
                payload.educational_qualifications = n.qual || n.educationalQualifications || "";
                payload.skills_required = n.skillsRequired || "";
              }
              await api.post(`/approvals/${c.db_id}/action/`, payload);
              
              if (n.status === "Approved") {
                if (n.type === "Role Request") {
                  setExistingRoles((prev) => {
                    const exists = prev.some((x) => x.role === n.role && x.dept === n.dept);
                    if (exists) return prev;
                    const cleanedSalary = n.salary ? n.salary.replace(/^₹/, "") : "";
                    return [...prev, {
                      id: `ROL-${Date.now()}`, dept: n.dept, role: n.role, type: "Full-time",
                      headcount: 1, filled: 0, currentFilled: 0, status: "Inactive", currentStatus: "Inactive",
                      experience: n.experience || "—",
                      salaryRange: cleanedSalary || "—",
                    }];
                  });
                  setTimeout(() => { navigate("/dashboard/existing-roles"); }, 300);
                } else if (n.type === "Job Request") {
                  setJobPostings((prev) => {
                    const exists = prev.some((p) => p.role === n.role);
                    if (exists) return prev;
                    return [...prev, {
                      id: `POST-${Date.now()}`, role: n.role, channel: "Career Page",
                      status: "Unpublished", posted: new Date().toLocaleDateString(), expiry: "30 Days", apps: 0,
                      location: n.location || "",
                      salary: n.salary || "",
                      vacancies: n.vacancies || "",
                      exp: n.experience || "",
                      qual: n.qual || "",
                      type: n.empType || "",
                      description: n.description || "",
                      educationalQualifications: n.educationalQualifications || "",
                      skillsRequired: n.skillsRequired || "",
                      job_request: n.source_db_id,
                      category: n.category || "",
                      department: n.dept || "",
                    }];
                  });
                  setTimeout(() => { navigate("/dashboard/applications"); }, 300);
                }
              }
            } catch (err) { alert("Action failed: " + err.message); }
          }
        }
      }
      await Promise.all([loadApprovals(), loadRoleRequests(), loadJobRequests()]);
    } finally {
      setIsLoading(false);
    }
  };

  const setJobPostings = async (updateArg) => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  const setJobApplications = async (updateArg) => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  const setGeneralApplications = async (updateArg) => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  const setInterviews = async (updateArg) => {
    setIsLoading(true);
    try {
      const current = interviews;
      let next = typeof updateArg === "function" ? updateArg(current) : updateArg;
      _setInterviews(next);

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
          if (c && c.db_id) {
            const cClean = { ...c, attendance: undefined };
            const nClean = { ...n, attendance: undefined };
            if (JSON.stringify(cClean) !== JSON.stringify(nClean)) {
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
      }
      await loadInterviews();
    } finally {
      setIsLoading(false);
    }
  };

  const setOffers = async (updateArg) => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  const setPanelists = async (updateArg) => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDeclineOffer = (candidate) => {
    const existingOffer = offers.find((o) => o.candidate === candidate.name && o.role === candidate.role);
    if (existingOffer) {
      setOffers((prev) => prev.filter((o) => o.id !== existingOffer.id));
    }
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    isLoading,
    setIsLoading,
    roleRequests,
    setRoleRequests,
    jobRequests,
    setJobRequests,
    approvalRequests,
    setApprovalRequests,
    existingRoles,
    setExistingRoles,
    jobPostings,
    setJobPostings,
    jobApplications,
    setJobApplications,
    generalApplications,
    setGeneralApplications,
    offers,
    setOffers,
    interviews,
    setInterviews,
    panelists,
    setPanelists,
    handleGiveOffer,
    handleDeclineOffer,
  };
}
