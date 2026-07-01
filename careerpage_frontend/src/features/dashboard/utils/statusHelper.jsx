import React from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";

/**
 * Maps a job status string dynamically to a CSS class name.
 * Normalizes string case and replaces spaces/special characters with hyphens.
 * E.g., "Interview Scheduled" -> "status-interview-scheduled"
 *
 * @param {string} status
 * @returns {string} CSS class name
 */
export function getStatusClass(status) {
  if (!status) return "status-default";
  return `status-${status.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}`;
}

/**
 * Maps a job status string to a Lucide icon component.
 *
 * @param {string} status
 * @returns {React.ReactNode} SVG Lucide icon
 */
export function getStatusIcon(status) {
  switch (status?.toLowerCase().trim()) {
    case "under review":
    case "applied":
      return <Clock size={13} />;
    case "shortlisted":
    case "offered":
    case "accepted":
      return <CheckCircle size={13} />;
    case "rejected":
    case "declined":
      return <XCircle size={13} />;
    case "interview scheduled":
    case "interview":
      return <AlertCircle size={13} />;
    default:
      return <HelpCircle size={13} />;
  }
}
