import React from "react";
import { NAV } from "../data";
import { T, font, radius, shadow, transition } from "../theme";

export default function Sidebar({
  currentUser,
  activeId,
  pendingCount,
  handleNav,
  setCurrentUser,
  setSelectedModule,
  navigate,
}) {
  return (
    <>
      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", paddingTop: "20px" }}>
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
          padding: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(0, 0, 0, 0.12)",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: radius.lg,
            padding: "12px",
            boxShadow: shadow.sm,
          }}
        >
          {/* User Details */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.full,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark || T.accent})`,
                color: T.primaryDark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: font.bold,
                fontSize: font.base,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              {currentUser?.name ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "HR"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: font.base, fontWeight: font.bold, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser?.name || "HR Admin"}
              </div>
              <div style={{ fontSize: font.xs, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser?.email || "hr@southpoint.edu"}
              </div>
            </div>
          </div>

          {/* Log Out Button */}
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
              width: "100%",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: radius.md,
              padding: "8px 12px",
              cursor: "pointer",
              color: "#ff9e9e",
              fontSize: font.xs + 1,
              fontWeight: font.semibold,
              fontFamily: font.body,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: transition.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220, 38, 38, 0.18)";
              e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.35)";
              e.currentTarget.style.color = "#ffb3b3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.color = "#ff9e9e";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
