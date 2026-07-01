import { useEffect } from "react";

// Pings the Render-hosted backend periodically so the free instance
// does not spin down between visits.
const KEEP_AWAKE_URL = "https://career-page-ksip.onrender.com";

export function useKeepAwake(intervalMs = 10000) {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(KEEP_AWAKE_URL, { method: "HEAD", mode: "no-cors" })
        .then(() => console.log("Keep-awake ping sent to Render server"))
        .catch((e) => console.error("Keep-awake ping failed:", e));
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
}
