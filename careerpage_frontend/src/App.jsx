import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { AnimatePresence } from "motion/react";
import { useKeepAwake } from "./lib/keepAwake";
import { Loader } from "./components/common/Loader";
import { CareerPage } from "./features/careerpage/CareerPage";
import { LoginModal } from "./features/careerpage/modals/LoginModal";
import { ApplyModal } from "./features/careerpage/modals/ApplyModal";
import JobApplicationModal from "./features/careerpage/modals/JobApplicationModal";
import { CandidateDashboard } from "./features/dashboard/CandidateDashboard";
import { api } from "./lib/api";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  useKeepAwake();

  const navigate = useNavigate();
  const location = useLocation();

  const [initialLoading, setInitialLoading] = useState(true);
  const [jobsList, setJobsList] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [loggedInUser, setLoggedInUser] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [signupData, setSignupData] = useState(null);
  const [savedProfileData, setSavedProfileData] = useState(null);
  const [cameFromApply, setCameFromApply] = useState(false);
  const [cameFromSection, setCameFromSection] = useState(undefined);
  const [applicationDraft, setApplicationDraft] = useState(null);
  const [applicationsData, setApplicationsData] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [dashboardInitialTab, setDashboardInitialTab] = useState("dashboard");
  const [candidateInterviews, setCandidateInterviews] = useState([]);

  const mapExperienceToBackend = (exp) => {
    if (!exp) return "0-1";
    const normalized = exp.toLowerCase().replace(/–/g, "-");
    if (normalized.includes("0-1") || normalized.includes("fresher")) return "0-1";
    if (normalized.includes("1-2") || normalized.includes("1-3")) return "1-2";
    if (normalized.includes("2-4") || normalized.includes("3-5")) return "3-5";
    if (normalized.includes("5-8")) return "5-8";
    if (normalized.includes("8+")) return "8+";
    return "0-1";
  };

  const mapExperienceFromBackend = (code) => {
    switch (code) {
      case "0-1": return "0–1 years (Fresher)";
      case "1-2": return "1–3 years";
      case "2-4": return "3–5 years";
      case "3-5": return "3–5 years";
      case "5-8": return "5–8 years";
      case "8+": return "8+ years";
      default: return "0–1 years (Fresher)";
    }
  };

  const mapToBackendProfile = (pd) => ({
    current_location: pd.location || "",
    educational_qualification: pd.education || "",
    degree_name: pd.degreeName || "",
    professional_qualification: pd.professionalQualification || "",
    professional_degree_name: pd.professionalQualificationOther || "",
    years_of_experience: mapExperienceToBackend(pd.experience),
    salary_expectation: pd.salary || "",
    extracurricular_qualification: pd.extracurricular || "",
    extracurricular_degree_name: pd.extracurricularOther || "",
    roles_interested: pd.selectedRoles || [],
    skills: pd.selectedSkills || [],
    linkedin_profile: pd.linkedin || "",
    portfolio_link: pd.portfolio || "",
  });

  const mapInterviewFromBackend = (i) => {
    let formattedDate = i.date;
    try {
      const d = new Date(i.date);
      if (!isNaN(d.getTime())) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        formattedDate = d.toLocaleDateString('en-US', options);
      }
    } catch {}

    let formattedTime = i.time;
    try {
      const match = i.time.match(/^(\d{2}):(\d{2})/);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        if (hours === 0) hours = 12;
        formattedTime = `${hours}:${minutes} ${ampm}`;
      }
    } catch {}

    const interviewerNames = (i.panel_details || []).map(p => p.name).join(", ") || "TBD";

    return {
      id: i.interview_id || i.id,
      role: i.role,
      date: formattedDate,
      time: formattedTime,
      interviewer: interviewerNames,
      mode: i.mode === "Offline" ? "In-Person" : (i.mode || "Online"),
      platform: i.mode === "Offline" ? "" : "Google Meet",
      link: i.meeting_link || "",
      status: i.status === "Scheduled" ? "Confirmed" : i.status,
    };
  };

  const loadCandidateData = async () => {
    try {
      const profile = await api.get("/auth/me/");
      setLoggedInUser(profile.full_name || profile.first_name || profile.email);
      setSignupData({
        name: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
      });

      const apps = await api.get("/applications/mine/");
      const appsList = apps.results ? apps.results : apps;
      const jobAppIds = appsList.map(a => a.posting);
      setAppliedJobIds(jobAppIds);

      const appsMap = {};
      appsList.forEach(a => {
        appsMap[a.posting] = {
          coverLetter: a.cover_letter,
          noticePeriod: a.notice_period,
          hasReferral: a.has_referral ? "Yes" : "No",
          referralEmpId: a.referral_emp_id || "",
          status: a.status,
          appliedDate: a.applied_date,
        };
      });
      setApplicationsData(appsMap);

      if (profile.profile) {
        setSavedProfileData({
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          location: profile.profile.current_location || "Guwahati, Assam",
          education: profile.profile.educational_qualification,
          degreeName: profile.profile.degree_name,
          professionalQualification: profile.profile.professional_qualification,
          professionalQualificationOther: profile.profile.professional_degree_name || "",
          experience: mapExperienceFromBackend(profile.profile.years_of_experience),
          salary: profile.profile.salary_expectation,
          extracurricular: profile.profile.extracurricular_qualification,
          extracurricularOther: profile.profile.extracurricular_degree_name || "",
          selectedRoles: profile.profile.roles_interested || [],
          selectedSkills: profile.profile.skills || [],
          linkedin: profile.profile.linkedin_profile,
          portfolio: profile.profile.portfolio_link,
          resumeUrl: profile.profile.resume || "",
          resumeFile: profile.profile.resume ? profile.profile.resume.split("/").pop() : "",
        });
      }

      // Fetch candidate interviews
      try {
        const ints = await api.get("/interviews/");
        const mappedInts = (ints.results ? ints.results : ints).map(mapInterviewFromBackend);
        setCandidateInterviews(mappedInts);
      } catch (err) {
        console.warn("Failed to load candidate interviews", err);
      }
    } catch (err) {
      console.warn("Failed to load candidate auth session", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  };

  const fetchPublicJobs = async () => {
    try {
      const data = await api.get("/job-postings/public/");
      const list = data.results ? data.results : data;
      const translated = list.map(jp => ({
        id: jp.id,
        title: jp.role,
        department: jp.department || "General",
        location: jp.location || "Guwahati, Assam",
        type: jp.type || "Full-time",
        experience: jp.experience || "Not specified",
        salary: jp.salary_range || "Not disclosed",
        qualifications: Array.isArray(jp.qualifications) ? jp.qualifications : (jp.qualification ? [jp.qualification] : ["Degree in relevant field"]),
        description: jp.description || "",
      }));
      setJobsList(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(translated)) {
          return translated;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to fetch public job postings", err);
    }
  };

  useEffect(() => {
    fetchPublicJobs();
    const interval = setInterval(fetchPublicJobs, 60000);
    const token = localStorage.getItem("access_token");
    if (token) {
      loadCandidateData();
    }
    return () => clearInterval(interval);
  }, []);

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    navigate(`/jobs/${job.id}/apply`);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedInUser("");
    setSignupData(null);
    setSavedProfileData(null);
    setAppliedJobIds([]);
    setApplicationsData({});
    setCandidateInterviews([]);
    setCameFromApply(false);
    setCameFromSection(undefined);
    setInitialLoading(true);
    setTimeout(() => {
      setInitialLoading(false);
      navigate("/");
    }, 1500);
  };

  const mergedProfileData = useMemo(() => {
    if (!savedProfileData && !applicationDraft) return null;
    return {
      fullName: savedProfileData?.fullName || (signupData ? `${signupData.name} ${signupData.lastName || ""}`.trim() : loggedInUser),
      email: savedProfileData?.email || signupData?.email || "",
      phone: savedProfileData?.phone || signupData?.phone || "",
      location: savedProfileData?.location || "Guwahati, Assam",
      resumeFile: savedProfileData?.resumeFile || "",
      resumeUrl: savedProfileData?.resumeUrl || "",
      education: applicationDraft?.education ?? savedProfileData?.education ?? "",
      degreeName: applicationDraft?.degreeName ?? savedProfileData?.degreeName ?? "",
      professionalQualification: applicationDraft?.professionalQual ?? savedProfileData?.professionalQualification ?? "",
      professionalQualificationOther: applicationDraft?.professionalQualOther ?? savedProfileData?.professionalQualificationOther ?? "",
      experience: applicationDraft?.experience ?? savedProfileData?.experience ?? "",
      salary: applicationDraft?.salary ?? savedProfileData?.salary ?? "",
      extracurricular: applicationDraft?.extracurricular ?? savedProfileData?.extracurricular ?? "",
      extracurricularOther: applicationDraft?.extracurricularOther ?? savedProfileData?.extracurricularOther ?? "",
      selectedRoles: applicationDraft?.selectedRoles ?? savedProfileData?.selectedRoles ?? [],
      selectedSkills: applicationDraft?.selectedSkills ?? savedProfileData?.selectedSkills ?? [],
      linkedin: applicationDraft?.linkedin ?? savedProfileData?.linkedin ?? "",
      portfolio: applicationDraft?.portfolio ?? savedProfileData?.portfolio ?? "",
    };
  }, [savedProfileData, applicationDraft, signupData, loggedInUser]);

  const isDashboard = location.pathname.startsWith("/dashboard");

  // Protect dashboard routes
  useEffect(() => {
    if (isDashboard && !loggedInUser && !initialLoading) {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
      }
    }
  }, [isDashboard, loggedInUser, initialLoading, navigate]);

  return (
    <>
      {!initialLoading && !isDashboard && (
        <CareerPage
          loggedInUser={loggedInUser}
          onLogin={() => navigate("/login")}
          onSignup={() => navigate("/signup")}
          onOpenDashboard={() => navigate("/dashboard")}
          onLogout={handleLogout}
          onApplyJob={handleApplyJob}
          appliedJobIds={appliedJobIds}
        />
      )}

      <Routes>
        <Route path="/login" element={
          <LoginModal
            onClose={() => { setSelectedJob(null); navigate("/"); }}
            initialTab="login"
            onLoginSuccess={() => {
              loadCandidateData();
              if (selectedJob) {
                navigate(`/jobs/${selectedJob.id}/apply`);
              } else {
                navigate("/");
              }
            }}
            onSignupSuccess={(data) => {
              setSignupData(data);
              navigate("/apply");
              loadCandidateData();
            }}
          />
        } />
        <Route path="/signup" element={
          <LoginModal
            onClose={() => { setSelectedJob(null); navigate("/"); }}
            initialTab="signup"
            onLoginSuccess={() => {
              loadCandidateData();
              if (selectedJob) {
                navigate(`/jobs/${selectedJob.id}/apply`);
              } else {
                navigate("/");
              }
            }}
            onSignupSuccess={(data) => {
              setSignupData(data);
              navigate("/apply");
              loadCandidateData();
            }}
          />
        } />
        <Route path="/apply" element={
          <ApplyModal
            signupData={signupData}
            onClose={() => { setSelectedJob(null); navigate("/"); }}
            onSubmitData={async (data) => {
              try {
                const formData = new FormData();
                formData.append("first_name", data.fullName.split(" ")[0] || "");
                formData.append("last_name", data.fullName.split(" ").slice(1).join(" ") || "");
                formData.append("phone", data.phone || "");
                formData.append("profile", JSON.stringify(mapToBackendProfile(data)));
                
                if (data.actualResumeFile) {
                  formData.append("profile.resume", data.actualResumeFile);
                }

                await api.put("/auth/me/", formData, true);

                await api.post("/general-applications/", {
                  candidate_name: data.fullName,
                  candidate_email: data.email,
                  candidate_phone: data.phone,
                  preferred_role: data.selectedRoles.join(", "),
                  preferred_dept: "General",
                  experience: data.experience,
                  qualification: `${data.education} (${data.degreeName})`,
                });

                toast.success("Submitted to Talent Pool successfully!");
                await loadCandidateData();
              } catch (err) {
                toast.error("Failed to submit general application: " + err.message);
              }
              if (selectedJob) {
                navigate(`/jobs/${selectedJob.id}/apply`);
              } else {
                navigate("/");
              }
            }}
          />
        } />
        <Route path="/jobs/:jobId/apply" element={
          <JobApplicationModalWrapper
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            jobsList={jobsList}
            navigate={navigate}
            onSubmit={async (jobId, formData, professionalData) => {
              try {
                if (professionalData) {
                  await api.put("/auth/me/", {
                    first_name: savedProfileData?.fullName?.split(" ")[0] || signupData?.name || loggedInUser,
                    last_name: savedProfileData?.fullName?.split(" ").slice(1).join(" ") || signupData?.lastName || "",
                    phone: savedProfileData?.phone || signupData?.phone || "",
                    profile: mapToBackendProfile(professionalData)
                  });
                }
                
                await api.post("/applications/", {
                  posting: jobId,
                  cover_letter: formData.coverLetter,
                  notice_period: formData.noticePeriod,
                  has_referral: formData.hasReferral === "Yes",
                  referral_emp_id: formData.referralEmpId || "",
                  referred_by: formData.hasReferral === "Yes" ? "Employee" : "None",
                  experience: professionalData ? professionalData.experience : (savedProfileData?.experience || ""),
                  qualification: professionalData ? `${professionalData.education} (${professionalData.degreeName})` : (savedProfileData ? `${savedProfileData.education} (${savedProfileData.degreeName})` : ""),
                });
                
                toast.success("Application submitted successfully!");
                await loadCandidateData();
              } catch (err) {
                toast.error("Failed to submit application: " + err.message);
              }
              setApplicationDraft(null);
              setCameFromSection(undefined);
              navigate("/");
            }}
            onEditProfile={(draftData, section) => {
              setApplicationDraft(draftData);
              setCameFromApply(true);
              setCameFromSection(section);
              setDashboardInitialTab("resume");
              navigate("/dashboard");
            }}
            profileData={{
              firstName: savedProfileData?.fullName?.split(" ")[0] || signupData?.name || loggedInUser,
              lastName: savedProfileData?.fullName?.split(" ").slice(1).join(" ") || signupData?.lastName || "",
              email: savedProfileData?.email || "",
              phone: savedProfileData?.phone || "",
              location: savedProfileData?.location || "Guwahati, Assam",
            }}
            resumeFile={savedProfileData?.resumeFile || null}
            resumeUrl={savedProfileData?.resumeUrl || null}
            draftData={applicationDraft}
            savedProfileData={savedProfileData}
            cameFromSection={cameFromSection}
          />
        } />
        <Route path="/dashboard" element={
          loggedInUser ? (
            <CandidateDashboard
              onClose={() => navigate("/")}
              onLogout={handleLogout}
              userName={loggedInUser}
              signupData={signupData}
              appliedJobIds={appliedJobIds}
              allJobs={jobsList}
              initialProfileData={mergedProfileData}
              initialTab={dashboardInitialTab}
              initialSection={cameFromSection}
              onProfileUpdate={async (updatedData) => {
                try {
                  const formData = new FormData();
                  formData.append("first_name", updatedData.fullName.split(" ")[0] || "");
                  formData.append("last_name", updatedData.fullName.split(" ").slice(1).join(" ") || "");
                  formData.append("phone", updatedData.phone || "");
                  formData.append("profile", JSON.stringify(mapToBackendProfile(updatedData)));
                  
                  if (updatedData.actualResumeFile) {
                    formData.append("profile.resume", updatedData.actualResumeFile);
                  }
                  
                  await api.put("/auth/me/", formData, true);
                  toast.success("Profile updated successfully!");
                  await loadCandidateData();
                } catch (err) {
                  toast.error("Failed to update profile: " + err.message);
                }
                setApplicationDraft(null);
              }}
              applicationsData={applicationsData}
              cameFromApply={cameFromApply}
              interviews={candidateInterviews}
            />
          ) : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AnimatePresence>
        {initialLoading && <Loader />}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </>
  );
}

function JobApplicationModalWrapper({
  selectedJob,
  setSelectedJob,
  jobsList,
  navigate,
  onSubmit,
  onEditProfile,
  profileData,
  resumeFile,
  resumeUrl,
  draftData,
  savedProfileData,
  cameFromSection
}) {
  const { jobId } = useParams();
  const job = selectedJob || jobsList.find(j => String(j.id) === String(jobId));

  if (!job) return null;

  return (
    <JobApplicationModal
      job={{
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
      }}
      onClose={() => {
        setSelectedJob(null);
        navigate("/");
      }}
      onSubmit={onSubmit}
      onEditProfile={onEditProfile}
      profileData={profileData}
      resumeFile={resumeFile}
      resumeUrl={resumeUrl}
      draftData={draftData}
      savedProfileData={savedProfileData}
      scrollToSection={cameFromSection}
    />
  );
}
