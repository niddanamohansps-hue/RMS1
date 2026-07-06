import { useState, useEffect } from "react";
import { T, font, radius, shadow, transition } from "./theme";
import { useBreakpoint } from "./hooks";
import { NAV } from "./data";
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

import { loadSession, saveSession } from "./utils/translators";
import useDashboardData from "./hooks/useDashboardData";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

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

  const [currentUser, setCurrentUser] = useState(() =>
    loadSession("currentUser", null)
  );
  const [selectedModule, setSelectedModule] = useState(() => {
    const saved = loadSession("selectedModule", null);
    const path = window.location.pathname;
    if (!saved && (path.startsWith("/dashboard") || path.startsWith("/panelist"))) {
      return "Recruitment";
    }
    return saved;
  });

  const {
    sidebarOpen,
    setSidebarOpen,
    isLoading,
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
  } = useDashboardData(currentUser, location.pathname, navigate);

  useEffect(() => { saveSession("currentUser", currentUser); }, [currentUser]);
  useEffect(() => { saveSession("selectedModule", selectedModule); }, [selectedModule]);

  // Protected route redirects
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.canvas, fontFamily: font.body, overflow: "hidden" }}>
      {/* Top bar (Header) - Full Width at very top */}
      <Header
        isMobile={isMobile}
        isCompact={isCompact}
        setSidebarOpen={setSidebarOpen}
        pageLabel={pageLabel}
        pendingCount={pendingCount}
        handleNav={handleNav}
        setSelectedModule={setSelectedModule}
        navigate={navigate}
      />

      {/* Main Body container below the header */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Desktop sidebar */}
        {!isCompact && (
          <div style={{
            width: 240,
            background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
            display: "flex", flexDirection: "column", flexShrink: 0,
            boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
          }}>
            <Sidebar
              currentUser={currentUser}
              activeId={activeId}
              pendingCount={pendingCount}
              handleNav={handleNav}
              setCurrentUser={setCurrentUser}
              setSelectedModule={setSelectedModule}
              navigate={navigate}
            />
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
              <Sidebar
                currentUser={currentUser}
                activeId={activeId}
                pendingCount={pendingCount}
                handleNav={handleNav}
                setCurrentUser={setCurrentUser}
                setSelectedModule={setSelectedModule}
                navigate={navigate}
              />
            </div>
          </>
        )}

        {/* Page content */}
        <div
          key={`${location.pathname}_${isLoading}`}
          className="dashboard-content-fade"
          style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px" : "28px 32px", position: "relative" }}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(250, 248, 245, 0.85)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}>
              {/* Spinning Ring and Pulsing Logo Container */}
              <div style={{ position: "relative", width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="loader-glow-ring" style={{ position: "absolute" }} />
                <div className="loader-logo-pulse" style={{
                  width: 46, height: 46,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 2,
                  overflow: "hidden",
                }}>
                  <img
                    src="/images-removebg-preview.png"
                    alt="South Point School Logo"
                    style={{ width: "72%", height: "72%", objectFit: "contain" }}
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: font.heading,
                  color: T.primary,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  South Point School
                </div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: font.body,
                  color: T.inkLight,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}>
                  Initializing Portal...
                </div>
              </div>
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
              <OfferManagement offers={offers} setOffers={setOffers} jobPostings={jobPostings} existingRoles={existingRoles} interviews={interviews} />
            } />
            <Route path="/dashboard/onboarding" element={
              <Onboarding
                jobPostings={jobPostings}
                offers={offers}
                jobApplications={jobApplications}
                generalApplications={generalApplications}
              />
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
