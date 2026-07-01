import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";
import "../css/popup/UnsavedChangesModal.css";

export function UnsavedChangesModal({ open, onDismiss, onDiscard, onSave }) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="uc-backdrop"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="uc-panel"
          >
            <div className="uc-icon-wrap">
              <AlertCircle size={28} color="#72102a" />
            </div>
            <h3 className="uc-title">
              Unsaved Changes
            </h3>
            <p className="uc-body">
              It looks like you have made some changes to your profile or resume. Do you want to keep these changes? If so, please choose to save them. If you choose to discard, they will not be saved.
            </p>

            <div className="uc-actions">
              <button
                onClick={onDiscard}
                className="uc-btn-discard"
              >
                Discard Changes
              </button>
              <button
                onClick={onSave}
                className="uc-btn-save"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
