import React from "react";
import { LogOut } from "lucide-react";
import { navItems } from "../../../../mockData/dashboardMockData";
import "../css/layout/DashboardSidebar.css";

export function DashboardSidebar({
  profile,
  profilePic,
  activeTab,
  hasUnsavedChanges,
  unreadCount,
  sidebarOpen,
  setSidebarOpen,
  setActiveTab,
  setPendingNavigation,
  setShowPhotoPopup,
  onLogout,
  loading,
}) {
  const handleTabClick = (id) => {
    if (activeTab === "resume" && hasUnsavedChanges) {
      setPendingNavigation({ type: "tab", targetId: id });
    } else {
      setActiveTab(id);
      setSidebarOpen(false);
    }
  };

  const handleLogoutClick = () => {
    if (activeTab === "resume" && hasUnsavedChanges) {
      setPendingNavigation({ type: "logout" });
    } else {
      if (onLogout) onLogout();
    }
  };

  // Reorder so notifications is last (per the original filter/map pattern)
  const orderedNavItems = [
    ...navItems.filter((n) => n.id !== "notifications"),
    ...navItems.filter((n) => n.id === "notifications"),
  ];

  return (
    <aside
      className={`ds-sidebar fixed left-0 top-[76px] bottom-0 z-[999] shadow-lg flex transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:top-0 md:shadow-none md:flex md:translate-x-0`}
    >
      {loading ? (
        <>
          {/* User avatar skeleton */}
          <div className="ds-avatar-section">
            <div className="skeleton animate-pulse" style={{ width: 64, height: 64, borderRadius: "50%", marginBottom: 12, marginLeft: "auto", marginRight: "auto" }} />
            <div className="skeleton animate-pulse" style={{ width: 100, height: 16, marginBottom: 6, marginLeft: "auto", marginRight: "auto" }} />
            <div className="skeleton animate-pulse" style={{ width: 80, height: 12, marginLeft: "auto", marginRight: "auto" }} />
          </div>

          {/* Nav skeleton */}
          <nav className="ds-nav" style={{ padding: "0 20px" }}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0" }}>
                <div className="skeleton animate-pulse" style={{ width: 16, height: 16, borderRadius: "50%" }} />
                <div className="skeleton animate-pulse" style={{ width: 80, height: 14 }} />
              </div>
            ))}
          </nav>

          {/* Logout skeleton */}
          <div className="ds-logout-wrap" style={{ padding: "0 20px 24px" }}>
            <div className="skeleton animate-pulse" style={{ width: 80, height: 32, borderRadius: 6 }} />
          </div>
        </>
      ) : (
        <>
          {/* User avatar */}
          <div className="ds-avatar-section">
            {/* Profile Picture Circle */}
            <div
              onClick={() => setShowPhotoPopup(true)}
              className="ds-avatar-wrap group"
              title="Update profile picture"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="ds-avatar-img"
                />
              ) : (
                <div className="ds-avatar-initials">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "C"}
                </div>
              )}
              {/* Subtle hover overlay */}
              <div className="ds-avatar-overlay">
                CHANGE
              </div>
            </div>

            <div className="ds-user-name">
              {profile.name}
            </div>
            <div className="ds-user-role">
              Job Applicant
            </div>
          </div>

          {/* Nav */}
          <nav className="ds-nav">
            {orderedNavItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`ds-nav-btn ${activeTab === id ? "ds-nav-btn--active" : "ds-nav-btn--inactive"
                  }`}
              >
                <Icon size={16} />
                {label}
                {id === "notifications" && unreadCount > 0 && (
                  <span className="ds-notif-badge">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="ds-logout-wrap">
            <button
              onClick={handleLogoutClick}
              className="ds-logout-btn"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
