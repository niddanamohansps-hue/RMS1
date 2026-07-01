import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera } from "lucide-react";
import "../css/popup/CameraModal.css";

export function CameraModal({ isOpen, cameraTargetDocKey, onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraTargetDocKey]);

  const startCamera = async () => {
    try {
      const constraints = cameraTargetDocKey
        ? { video: { width: 640, height: 480, facingMode: "environment" } }
        : { video: { width: 300, height: 300, facingMode: "user" } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      // Suppress alert popups during testing, but notify parent
      onClose();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = cameraTargetDocKey ? 640 : 300;
      canvas.height = cameraTargetDocKey ? 480 : 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        onCapture(dataUrl, cameraTargetDocKey);
      }
    }
    stopCamera();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="cm-backdrop"
          onClick={() => {
            stopCamera();
            onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="cm-panel"
          >
            <h3 className="cm-title">
              {cameraTargetDocKey ? "Scan Document" : "Take Photo"}
            </h3>

            {/* Video wrapper preview */}
            <div
              className={`cm-video-wrap ${
                cameraTargetDocKey ? "cm-video-wrap--doc" : "cm-video-wrap--photo"
              }`}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="cm-video"
              />
            </div>

            <div className="cm-actions">
              <button
                onClick={handleCapture}
                className="cm-btn-capture"
              >
                <Camera size={16} /> Capture {cameraTargetDocKey ? "Document" : "Photo"}
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="cm-btn-cancel"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
