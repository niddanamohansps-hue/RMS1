import { useState } from "react";
import { motion } from "motion/react";
import { MessageSquare, Star, Send } from "lucide-react";
import { GOLD } from "../../../lib/constants";
import "./css/FeedbackForm.css";

// Self-contained feedback form with star rating. Owns its own form state.
export function FeedbackForm() {
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    category: "",
    rating: 0,
    hoverRating: 0,
    message: "",
    submitted: false,
  });

  const handleSubmit = () => {
    if (feedback.name && feedback.email && feedback.category && feedback.rating && feedback.message)
      setFeedback({ ...feedback, submitted: true });
  };

  const activeStar = (star) => star <= (feedback.hoverRating || feedback.rating);

  return (
    <section className="ff-section py-20 px-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="ff-icon-badge">
              <MessageSquare size={18} />
            </div>
            <span className="ff-eyebrow">We'd love to hear from you</span>
          </div>

          <h2 className="ff-heading">Share Your Feedback</h2>

          <p className="ff-subtext">
            Help us improve your experience. We value every opinion.
          </p>
        </motion.div>

        {/* ── Success state ───────────────────────────────────────────────── */}
        {feedback.submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ff-success-card"
          >
            <div className="ff-success-icon">
              <Send size={22} />
            </div>
            <h3 className="ff-success-title">Thank You!</h3>
            <p className="ff-success-msg">Your feedback has been submitted successfully.</p>
          </motion.div>

        ) : (

          /* ── Form card ───────────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="ff-form-card"
          >
            {/* Name + Email row */}
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="ff-label">
                  Full Name <span className="ff-required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                  className="ff-input"
                />
              </div>

              <div>
                <label className="ff-label">
                  Email Address <span className="ff-required">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  className="ff-input"
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="ff-label">
                Category <span className="ff-required">*</span>
              </label>
              <select
                value={feedback.category}
                onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                className={`ff-select${feedback.category ? "" : " placeholder"}`}
              >
                <option value="">Select a category</option>
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Operations">Operations &amp; Support</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Star rating */}
            <div className="mb-5">
              <label className="ff-label">
                Overall Rating <span className="ff-required">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className="ff-star"
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    onMouseEnter={() => setFeedback({ ...feedback, hoverRating: star })}
                    onMouseLeave={() => setFeedback({ ...feedback, hoverRating: 0 })}
                    style={{
                      fill  : activeStar(star) ? GOLD : "transparent",
                      color : activeStar(star) ? GOLD : "#ccc",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="ff-label">
                Your Feedback <span className="ff-required">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Share your thoughts, suggestions, or experience..."
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                className="ff-textarea"
              />
              <div className="ff-char-count">
                {feedback.message.length} character{feedback.message.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} className="ff-submit-btn">
              <Send size={16} /> Submit Feedback
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
}
