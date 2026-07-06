import React from "react";
import { T, font, radius, transition } from "../theme";

export default function Header({
  isMobile,
  isCompact,
  setSidebarOpen,
  pageLabel,
  pendingCount,
  handleNav,
  setSelectedModule,
  navigate,
}) {
  return (
    <div
      style={{
        background: "rgba(114, 16, 42, 0.85)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Left Section: hamburger + school branding */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16 }}>
        {isCompact && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-hover"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(250, 248, 245, 0.35)",
              borderRadius: radius.md,
              cursor: "pointer", padding: "6px 10px",
              color: "#fff", fontSize: 16, lineHeight: 1,
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
            color: "rgba(250, 248, 245, 0.7)",
            textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.3, marginTop: 1,
          }}>
            Guwahati, Assam
          </div>
        </div>
      </div>

      {/* Right Section: page label + buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!isMobile && (
          <span style={{
            fontSize: font.base + 1, fontWeight: font.bold, fontFamily: font.body,
            color: "rgba(250, 248, 245, 0.9)", letterSpacing: "-0.01em", marginRight: 8,
          }}>
            {pageLabel}
          </span>
        )}
        {pendingCount > 0 && (
          <button
            onClick={() => handleNav("approval-requests")}
            className="btn-hover badge-pulse"
            style={{
              background: T.accent,
              border: "none",
              borderRadius: radius.full, padding: "5px 14px",
              fontSize: font.sm, fontWeight: font.bold,
              fontFamily: font.body,
              color: "#1a0a0a",
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
            background: "transparent",
            border: "1.5px solid rgba(250, 248, 245, 0.4)",
            borderRadius: radius.md,
            padding: "6px 14px",
            cursor: "pointer",
            color: "#faf8f5",
            fontWeight: 700,
            fontSize: 12,
            transition: transition.fast,
            fontFamily: font.body,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#fff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(250, 248, 245, 0.4)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Back to Modules
        </button>
      </div>
    </div>
  );
}
