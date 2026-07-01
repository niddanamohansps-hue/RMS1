import { useState } from "react";
import { T, font, radius, shadow, transition } from "../theme";

export default function ModuleSelector({ currentUser, onSelectModule, onLogout }) {
  const modules = [
    {
      id: "Recruitment",
      title: "HR & Recruitment",
      icon: "💼",
      desc: "Publish vacancies, evaluate applications, coordinate panel interviews, and manage onboarding for new academic and administrative staff.",
      status: "active",
      badge: "ACTIVE WORKSPACE",
      badgeBg: T.primary,
      badgeColor: "#ffffff",
      iconBg: "#fae8ff",
      titleColor: T.primary,
      linkColor: T.primary,
    },
    {
      id: "Academics",
      title: "Academics & Curriculum",
      icon: "📚",
      desc: "Configure syllabus frameworks, manage classroom timetables, track progression, and generate student gradebooks.",
      status: "locked",
      badge: "ACADEMICS DESK",
      badgeBg: "#f3e8ff",
      badgeColor: "#6b21a8",
      iconBg: "#ede9fe",
      titleColor: "#1e3a8a",
      linkColor: "#1e3a8a",
    },
    {
      id: "Students",
      title: "Student Information (SIS)",
      icon: "👥",
      desc: "Track student admissions, coordinate classroom allocations, log daily attendance, and manage guardian registries.",
      status: "locked",
      badge: "REGISTRY DESK",
      badgeBg: "#eff6ff",
      badgeColor: "#1d4ed8",
      iconBg: "#dbeafe",
      titleColor: "#1e3a8a",
      linkColor: "#1e3a8a",
    },
    {
      id: "Finance",
      title: "Financial Operations",
      icon: "💳",
      desc: "Administer student fee collections, process payroll allocations, track receipts, and audit departmental budgets.",
      status: "locked",
      badge: "FINANCE DESK",
      badgeBg: "#f0fdf4",
      badgeColor: "#15803d",
      iconBg: "#dcfce7",
      titleColor: "#14532d",
      linkColor: "#14532d",
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "linear-gradient(rgba(60, 5, 20, 0.88) 0%, rgba(30, 3, 10, 0.94) 100%), url('/school_campus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "24px 30px",
        fontFamily: font.body,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* CSS stylesheet for spring-based responsive zooms and animations */}
      <style>{`
        .mis-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .mis-card-active:hover {
          transform: translateY(-8px) scale(1.03) !important;
          border-color: ${T.accent} !important;
          box-shadow: 0 20px 40px rgba(114, 16, 42, 0.25), 0 10px 20px rgba(201, 168, 76, 0.2) !important;
        }
        .mis-card-locked:hover {
          transform: translateY(-4px) scale(1.01) !important;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
        }
        
        @keyframes float-blob-1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-blob-2 {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(20px) scale(1); }
        }

        @media (max-width: 768px) {
          .mis-top-bar {
            padding: 10px 16px !important;
            margin-bottom: 24px !important;
            border-radius: 16px !important;
          }
          .mis-logo-container {
            width: 38px !important;
            height: 38px !important;
          }
          .mis-logo-container img {
            height: 30px !important;
          }
          .mis-brand {
            gap: 8px !important;
          }
          .mis-title {
            font-size: 16px !important;
          }
          .mis-subtitle {
            display: none !important;
          }
          .mis-user-email {
            display: none !important;
          }
          .mis-user-divider {
            display: none !important;
          }
          .mis-logout-btn {
            padding: 6px 12px !important;
            border-radius: 8px !important;
          }
          .mis-main-title {
            font-size: 24px !important;
          }
          .mis-main-title-container {
            margin-bottom: 24px !important;
          }
        }
      `}</style>

      {/* Floating background blur blobs for premium depth */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 380,
          height: 380,
          background: `radial-gradient(circle, ${T.primary} 0%, transparent 70%)`,
          opacity: 0.22,
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "float-blob-1 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 420,
          height: 420,
          background: `radial-gradient(circle, ${T.accent} 0%, transparent 70%)`,
          opacity: 0.14,
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "float-blob-2 18s ease-in-out infinite",
        }}
      />

      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100%", width: "100%", flex: 1 }}>
        {/* Top bar (rounded panel) */}
        <div
          className="mis-top-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto 40px",
            background: "linear-gradient(135deg, #4c0519 0%, #31040f 100%)",
            border: "1.5px solid rgba(201, 168, 76, 0.15)",
            borderRadius: 20,
            padding: "16px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
          }}
        >
          <div className="mis-brand" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="mis-logo-container" style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}>
              <img
                src="/images-removebg-preview.png"
                alt="South Point School Logo"
                style={{ height: 44, width: "auto", objectFit: "contain" }}
              />
            </div>
            <div>
              <div className="mis-title" style={{ fontSize: 22, fontWeight: "bold", color: T.accent, fontFamily: "Georgia, serif", letterSpacing: "0.01em" }}>
                South Point School
              </div>
              <div className="mis-subtitle" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255, 255, 255, 0.75)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
                Management Information System (MIS) Portal
              </div>
            </div>
          </div>

          <div className="mis-user-panel" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="mis-user-email" style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
              {currentUser?.email || "f@gmail.com"}
            </div>
            
            <div className="mis-user-divider" style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />

            {/* Log Out Button */}
            <button
              onClick={onLogout}
              className="btn-hover mis-logout-btn"
              style={{
                background: "linear-gradient(135deg, #72102a 0%, #5c0c21 100%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                padding: "8px 18px",
                cursor: "pointer",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                fontFamily: font.body,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "all 0.2s",
              }}
            >
              <span>Log Out</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {/* Section title and divider */}
          <div style={{ textAlign: "center", marginBottom: 48 }} className="animate-fade-in-up mis-main-title-container">
            <h2
              className="mis-main-title"
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: "#ffffff",
                margin: 0,
                fontFamily: "Georgia, serif",
                letterSpacing: "-0.01em",
              }}
            >
              Management <span style={{ color: T.accent }}>Information System</span>
            </h2>
            
            {/* Shield divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "16px 0" }}>
              <div style={{ width: 60, height: 1, background: `linear-gradient(to left, ${T.accent}, transparent)` }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill={T.accent} stroke={T.accent} strokeWidth="1">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div style={{ width: 60, height: 1, background: `linear-gradient(to right, ${T.accent}, transparent)` }} />
            </div>
            
            <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.85)", marginTop: 8, maxWidth: 600, lineHeight: 1.6, margin: "8px auto 0", fontWeight: 500 }}>
              Welcome to the South Point School administrative console.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.85)", marginTop: 4, maxWidth: 600, lineHeight: 1.6, margin: "0 auto", fontWeight: 500 }}>
              Select an authorized department workspace below to manage institutional operations.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
              width: "100%",
            }}
          >
            {modules.map((m, idx) => {
              const isActive = m.status === "active";
              return (
                <div
                  key={m.id}
                  onClick={() => isActive && onSelectModule(m.id)}
                  className={`mis-card ${isActive ? "mis-card-active card-hover" : "mis-card-locked"}`}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 24,
                    border: isActive ? `2.5px solid ${T.accent}` : `1.5px solid rgba(0,0,0,0.08)`,
                    padding: "32px 24px",
                    cursor: isActive ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: isActive 
                      ? `0 20px 40px rgba(114, 16, 42, 0.25), 0 10px 20px rgba(201, 168, 76, 0.2), 0 0 0 1px ${T.accent}` 
                      : shadow.sm,
                    minHeight: 340,
                    animation: "fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
                    animationDelay: `${idx * 0.06}s`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Subtle Wave decoration at bottom */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "40px",
                    backgroundImage: `radial-gradient(ellipse at 50% 100%, ${m.iconBg}33 0%, transparent 70%)`,
                    pointerEvents: "none"
                  }} />

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    {/* Badge */}
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        borderRadius: 99,
                        padding: "6px 14px",
                        background: m.badgeBg,
                        color: m.badgeColor,
                        marginBottom: 24,
                        textAlign: "center"
                      }}
                    >
                      {m.badge}
                    </span>

                    {/* Circular Icon Wrapper */}
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: m.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        marginBottom: 24,
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.06)`
                      }}
                    >
                      {m.icon}
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: m.titleColor,
                        margin: "0 0 12px 0",
                        fontFamily: "Georgia, serif",
                        textAlign: "center"
                      }}
                    >
                      {m.title}
                    </h3>
                    
                    {/* Description */}
                    <p
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.6,
                        color: "#4b5563",
                        margin: 0,
                        textAlign: "center"
                      }}
                    >
                      {m.desc}
                    </p>
                  </div>

                  {/* Enter Module Link */}
                  <div
                    style={{
                      marginTop: 24,
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: m.linkColor,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.25s ease",
                    }}
                  >
                    <span>Enter Module ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
