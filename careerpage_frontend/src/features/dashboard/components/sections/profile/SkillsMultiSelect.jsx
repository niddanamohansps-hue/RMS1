import React, { useState, useRef, useEffect } from "react";
import { ALL_SKILLS } from "../../../../../mockData/dashboardMockData";
import "../../css/sections/profile/SkillsMultiSelect.css";

export function SkillsMultiSelect({ options = ALL_SKILLS, selected, onChange, placeholder = "Select or add items…" }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const wrapperRef = useRef(null);

  // Close the dropdown when clicking anywhere outside this component.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (opt) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustom("");
  };

  return (
    <div className="sms-wrapper" ref={wrapperRef}>
      <div
        onClick={() => setOpen(!open)}
        className="sms-trigger"
      >
        {selected.length === 0 && (
          <span className="sms-placeholder">
            {placeholder}
          </span>
        )}
        {selected.map((s) => (
          <span
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              toggle(s);
            }}
            className="sms-badge"
          >
            {s} &times;
          </span>
        ))}
        <span
          className={`sms-caret ${
            open ? "sms-caret--open" : "sms-caret--closed"
          }`}
        >
          ▼
        </span>
      </div>
      {open && (
        <div className="sms-dropdown">
          <div className="sms-custom-row">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add custom item…"
              className="sms-custom-input"
            />
            <button
              type="button"
              onClick={addCustom}
              className="sms-btn-add"
            >
              Add
            </button>
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              className={`sms-option ${
                selected.includes(opt) ? "sms-option--selected" : "sms-option--unselected"
              }`}
            >
              {opt}
              {selected.includes(opt) && <span className="sms-checkmark">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
