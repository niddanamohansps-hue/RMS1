import { motion } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LOADER_URL } from "../../lib/constants";

// Full-screen loading overlay shown during page/view transitions. The dots
// animation is a Lottie animation loaded locally.
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
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        style={{
          width: 250,
          height: 250,
        }}
      >
        <DotLottieReact
          src={LOADER_URL}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>
    </motion.div>
  );
}
