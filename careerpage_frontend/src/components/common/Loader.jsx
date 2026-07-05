import { motion } from "motion/react";
import logoImg from "../../assets/logo.png";

// Full-screen loading overlay shown during page/view transitions.
// Uses a maroon-gold spinning ring with a pulsing school logo at center,
// matching the admin dashboard's premium loader.
export function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "rgba(250, 248, 245, 0.85)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {/* Spinning Ring + Pulsing Logo */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        style={{
          position: "relative",
          width: 84,
          height: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer gradient spinning ring */}
        <div className="loader-glow-ring" style={{ position: "absolute" }} />

        {/* Inner pulsing logo */}
        <div
          className="loader-logo-pulse"
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          <img
            src={logoImg}
            alt="South Point School Logo"
            style={{ width: "72%", height: "72%", objectFit: "contain" }}
          />
        </div>
      </motion.div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "'Playfair Display', serif",
            color: "#72102a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          South Point School
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color: "#6b5c5c",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          Loading...
        </div>
      </div>
    </motion.div>
  );
}
