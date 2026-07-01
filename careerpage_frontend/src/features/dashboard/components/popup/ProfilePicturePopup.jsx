import React from "react";
import { motion, AnimatePresence } from "motion/react";
import "../css/popup/ProfilePicturePopup.css";

export function ProfilePicturePopup({
  open,
  picRef,
  onTakePhoto,
  onPhotoUpload,
  onClose,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="pp-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="pp-panel"
          >
            <h3 className="pp-title">
              Update Profile Picture
            </h3>
            <div className="pp-actions">
              <button
                onClick={onTakePhoto}
                className="pp-btn-photo"
              >
                Take Photo (Webcam)
              </button>
              <label className="pp-label-upload">
                Upload File
                <input
                  ref={picRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onPhotoUpload}
                />
              </label>
              <button
                onClick={onClose}
                className="pp-btn-cancel"
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
