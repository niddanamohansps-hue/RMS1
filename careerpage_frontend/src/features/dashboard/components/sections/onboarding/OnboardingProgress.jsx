import React from "react";
import { CheckCircle, ClipboardCheck } from "lucide-react";
import "../../css/sections/onboarding/OnboardingProgress.css";

export function OnboardingProgress({ steps }) {
  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="op-card">
      <div className="op-header">
        <ClipboardCheck size={16} />
        <h2 className="op-title">Onboarding Progress</h2>
      </div>

      <div className="op-body">
        <div className="op-progress-section">
          <div className="op-progress-row">
            <span className="op-progress-label">Overall Progress</span>
            <span className="op-progress-pct">{pct}%</span>
          </div>
          <div className="op-progress-bar-wrap">
            <div
              style={{ width: `${pct}%` }}
              className="op-progress-bar-fill"
            />
          </div>
        </div>

        {steps.map(({ label, done, desc }, idx) => (
          <div
            key={label}
            className={`op-step-item ${idx === steps.length - 1 ? "op-step-item--last" : ""}`}
          >
            <div className="op-step-left">
              <div
                className={`op-step-circle ${
                  done ? "op-step-circle--done" : "op-step-circle--undone"
                }`}
              >
                {done ? (
                  <CheckCircle size={12} color="#fff" />
                ) : (
                  <span className="op-step-num">
                    {idx + 1}
                  </span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`op-step-line ${
                    done ? "op-step-line--done" : "op-step-line--undone"
                  }`}
                />
              )}
            </div>
            <div className="op-step-content">
              <div
                className={`op-step-title ${
                  done ? "op-step-title--done" : "op-step-title--undone"
                }`}
              >
                {label}
              </div>
              <div className="op-step-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
