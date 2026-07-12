export const loadSession = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key) || sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export const saveSession = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    sessionStorage.setItem(key, serialized);
  } catch { /* ignore */ }
};

export const fromBackendRole = (r) => ({
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

export const toBackendRole = (r) => ({
  role_id: r.id,
  department: r.dept,
  role: r.role,
  type: r.type,
  headcount: r.headcount,
  filled: r.filled,
  status: r.currentStatus || r.status,
  experience: r.experience !== "—" ? r.experience : "",
  salary_range: r.salaryRange !== "—" ? r.salaryRange : "",
});

export const fromBackendRoleRequest = (rr) => ({
  id: rr.request_id,
  db_id: rr.id,
  dept: rr.department,
  role: rr.role,
  just: rr.justification,
  salary: rr.salary_range || "",
  salaryRange: rr.salary_range || "",
  experience: rr.experience || "",
  type: rr.type || "Full-time",
  status: rr.status,
  date: rr.date,
  history: rr.history || [],
});

export const sanitizeRequestStatus = (status) => {
  const valid = ["Pending", "Approved", "Rejected", "Sent Back", "Cancelled"];
  return valid.includes(status) ? status : "Pending";
};

export const toBackendRoleRequest = (rr, currentUser) => ({
  request_id: rr.id,
  department: rr.dept,
  role: rr.role,
  justification: rr.just || "",
  salary_range: rr.salaryRange || rr.salary || "",
  experience: rr.experience || "",
  type: rr.type || "Full-time",
  status: sanitizeRequestStatus(rr.status),
  submitted_by: currentUser?.name || "HR Admin",
});

export const fromBackendJobRequest = (jr) => ({
  id: jr.request_id,
  db_id: jr.id,
  role: jr.role,
  department: jr.department || "",
  vacancies: jr.vacancies,
  vac: jr.vacancies,
  experience: jr.experience,
  exp: jr.experience,
  salary: jr.salary_range,
  sal: jr.salary_range,
  type: jr.type,
  qual: jr.educational_qualifications || "",
  location: jr.location || "",
  category: jr.category || "",
  description: jr.description || "",
  justification: jr.justification || "",
  educationalQualifications: jr.educational_qualifications || "",
  skillsRequired: jr.skills_required || "",
  status: jr.status,
  date: jr.created_at ? jr.created_at.substring(0, 10) : "",
  history: jr.history || [],
});

export const toBackendJobRequest = (jr, currentUser) => ({
  request_id: jr.id,
  role: jr.role,
  department: jr.department || "",
  vacancies: jr.vacancies || jr.vac || 1,
  experience: jr.experience || jr.exp || "",
  salary_range: jr.salary || jr.sal || "",
  type: jr.type || "Full-time",
  description: jr.description || "",
  justification: jr.justification || jr.just || "",
  location: jr.location || "",
  category: jr.category || "",
  educational_qualifications: jr.educationalQualifications || jr.qual || "",
  skills_required: jr.skillsRequired || "",
  status: sanitizeRequestStatus(jr.status),
  submitted_by: currentUser?.name || "HR Admin",
});

export const fromBackendApproval = (ap) => ({
  id: ap.id,
  db_id: ap.id,
  type: ap.type,
  title: ap.title,
  dept: ap.department,
  by: ap.submitted_by,
  requestedBy: ap.submitted_by || "HR Admin",
  date: ap.date,
  status: ap.status,
  sourceId: ap.source_request_id || ap.request_id,
  source_db_id: ap.source_db_id || null,
  just: ap.justification || "",
  vacancies: ap.vacancies || 1,
  qual: ap.educational_qualifications || "",
  empType: ap.employment_type || "Full-time",
  experience: ap.experience || "",
  salary: ap.salary_range || "",
  role: ap.title,
  location: ap.location || "",
  category: ap.category || "",
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

export const fromBackendPosting = (jp) => ({
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
  category: jp.category || "",
  department: jp.department || "",
  description: jp.description,
  educationalQualifications: jp.educational_qualifications || "",
  skillsRequired: jp.skills_required || "",
  job_request: jp.job_request || null,
});

export const toBackendPosting = (jp) => {
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
    const valid = ["External", "Internal", "Career Page"];
    return valid.includes(channelStr) ? channelStr : "Career Page";
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
    job_request: jp.job_request || null,
    category: jp.category || "",
    department: jp.department || jp.dept || "",
  };
};

export const fromBackendJobApp = (ja) => ({
  id: ja.app_id,
  db_id: ja.id,
  candidate_id: ja.candidate,
  name: ja.candidate_name,
  email: ja.candidate_email,
  phone: ja.candidate_phone,
  role: ja.role,
  posting_db_id: ja.posting || null,
  jobPostingId: ja.posting_id || "",
  exp: ja.experience,
  qualification: ja.qualification,
  applied: ja.applied_date,
  status: ja.status,
  referredBy: ja.referred_by || "None",
  admin_note: ja.admin_note || "",
  dept: ja.department || "",
  resume: ja.resume || "",
  location: ja.location || "",
  skills: ja.skills || [],
  salary: ja.salary || "",
  educationalQualification: ja.educational_qualification || ja.qualification || "",
  professionalQualification: ja.professional_qualification || "",
  extracurricularQualification: ja.extracurricular_qualification || "",
});

export const fromBackendGeneralApp = (ga) => ({
  id: ga.app_id,
  db_id: ga.id,
  name: ga.candidate_name,
  email: ga.candidate_email,
  phone: ga.candidate_phone,
  preferredRole: ga.preferred_role,
  exp: ga.experience,
  qualification: ga.qualification,
  applied: ga.applied_date,
  status: ga.status,
  admin_note: ga.admin_note || "",
  resume: ga.resume || "",
  location: ga.location || "",
  skills: ga.skills || [],
  salary: ga.salary || "",
  educationalQualification: ga.educational_qualification || ga.qualification || "",
  professionalQualification: ga.professional_qualification || "",
  extracurricularQualification: ga.extracurricular_qualification || "",
});

export const mapTimeToBackend = (timeStr) => {
  if (!timeStr) return "09:00:00";
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  }
  return timeStr;
};

export const mapTimeFromBackend = (timeStr) => {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

export const fromBackendInterview = (i) => {
  let frontendStatus = i.status;
  if (frontendStatus === "Scheduled") {
    frontendStatus = "Pending";
  }

  let frontendRec = i.recommendation || "—";
  if (!frontendRec) {
    frontendRec = "—";
  } else if (frontendRec === "On Hold") {
    frontendRec = "Hold";
  } else if (frontendRec === "Selected") {
    frontendRec = "Hire";
  } else if (frontendRec === "Rejected") {
    frontendRec = "Reject";
  }

  const frontendTime = mapTimeFromBackend(i.time);
  let frontendMode = i.mode === "Offline" ? "In-Person" : (i.mode || "Online");

  let evaluations = [];
  try {
    evaluations = JSON.parse(i.feedback || "[]");
    if (!Array.isArray(evaluations)) evaluations = [];
  } catch {
    evaluations = [];
  }

  return {
    id: i.interview_id,
    db_id: i.id,
    candidate: i.candidate_name,
    role: i.role,
    date: i.date,
    time: frontendTime,
    panel: (i.panel_details || i.panel || []).map(p => typeof p === 'object' ? p.name : p),
    panel_ids: (i.panel || []).map(p => typeof p === 'object' ? p.id : p),
    score: i.score || "",
    rec: frontendRec,
    feedback: i.feedback || "",
    evaluations: evaluations,
    status: frontendStatus,
    mode: frontendMode,
    meetingLink: i.meeting_link,
    round: i.round,
    application: i.application,
    reminderSentAt: i.reminder_sent_at,
  };
};

export const toBackendInterview = (i, panelIds) => {
  let backendStatus = i.status || "Pending";

  let backendRec = i.rec || "";
  if (backendRec === "—") {
    backendRec = "";
  } else if (backendRec === "Hold") {
    backendRec = "Hold";
  } else if (backendRec === "Hire") {
    backendRec = "Hire";
  } else if (backendRec === "Strong Hire") {
    backendRec = "Strong Hire";
  } else if (backendRec === "Reject") {
    backendRec = "Reject";
  }

  const backendTime = mapTimeToBackend(i.time);
  let backendMode = i.mode === "In-Person" ? "Offline" : (i.mode || "Online");

  const feedbackValue = Array.isArray(i.evaluations) && i.evaluations.length > 0
    ? JSON.stringify(i.evaluations)
    : (i.feedback || "");

  return {
    interview_id: i.id,
    candidate_name: i.candidate,
    role: i.role,
    date: i.date,
    time: backendTime,
    panel: panelIds || [],
    status: backendStatus,
    mode: backendMode,
    meeting_link: i.meetingLink || "",
    round: i.round || 1,
    score: (i.score !== null && i.score !== undefined && i.score !== "") ? parseInt(i.score) : null,
    recommendation: backendRec,
    feedback: feedbackValue,
    application: i.application || null,
    reminder_sent_at: i.reminderSentAt || null,
  };
};

export const fromBackendOffer = (o) => {
  let uiStatus = o.status;
  if (o.status === "Sent") uiStatus = "Pending";
  else if (o.status === "Accepted") uiStatus = "Accept";
  else if (o.status === "Rejected") uiStatus = "Decline";
  return {
    id: o.offer_id,
    db_id: o.id,
    candidate: o.candidate_name,
    role: o.role,
    ctc: o.ctc,
    issued: o.issued_date,
    expiry: o.expiry_date,
    joining: o.joining_date,
    status: uiStatus,
    onboarding: o.onboarding,
  };
};

export const toBackendOffer = (o, candidateId) => {
  let dbStatus = o.status;
  if (o.status === "Pending") dbStatus = "Sent";
  else if (o.status === "Accept") dbStatus = "Accepted";
  else if (o.status === "Decline") dbStatus = "Rejected";
  return {
    offer_id: o.id,
    candidate: candidateId || null,
    candidate_name: o.candidate,
    role: o.role,
    ctc: o.ctc,
    issued_date: o.issued || null,
    expiry_date: o.expiry || null,
    joining_date: o.joining || null,
    status: dbStatus,
  };
};
