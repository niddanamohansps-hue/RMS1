export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "existing-roles", label: "Existing Roles", icon: "◧" },
  { id: "role-requests", label: "Role Requests", icon: "◈" },
  { id: "job-requests", label: "Job Requests", icon: "◉" },
  { id: "approval-requests", label: "Approve Request", icon: "◎" },
  { id: "applications", label: "Applications", icon: "☰" },
  { id: "job-postings", label: "Job Postings", icon: "◆" },
  { id: "interview-panel", label: "Interview Panel", icon: "◐" },
  {
  id: "panelist",
  label: "Panelist",
  icon: "◐",
},
  { id: "offer-management", label: "Offer Management", icon: "◑" },
  { id: "onboarding", label: "Onboarding", icon: "◒" },
];

export const EXISTING_ROLES = [];

export const ROLE_REQUESTS = [];

export const JOB_REQUESTS = [];
export const APPROVALS = [];
export const POSTINGS = [];
export const JOB_APPLICATIONS = [];
export const GENERAL_APPLICATIONS = [];
export const INTERVIEWS = [];
export const OFFERS = [];
export const ONBOARDING = [];


export const ROLE_OPTIONS = [...new Set(EXISTING_ROLES.map((r) => r.role))].map((r) => ({ value: r, label: r }));
export const DEPT_OPTIONS = [...new Set(EXISTING_ROLES.map((r) => r.dept))].map((d) => ({ value: d, label: d }));
export const VACANCY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ value: String(n), label: String(n) }));
export const EXP_OPTIONS = [
  { value: "0–1 yrs", label: "0–1 years" },
  { value: "1–2 yrs", label: "1–2 years" },
  { value: "2–4 yrs", label: "2–4 years" },
  { value: "3–5 yrs", label: "3–5 years" },
  { value: "5–8 yrs", label: "5–8 years" },
  { value: "8+ yrs", label: "8+ years" },
];
export const QUAL_OPTIONS = [
  { value: "Graduate", label: "Graduate" },
  { value: "Post Graduate", label: "Post Graduate" },
  { value: "B.Ed", label: "B.Ed" },
  { value: "M.Ed", label: "M.Ed" },
  { value: "B.Sc", label: "B.Sc" },
  { value: "M.Sc", label: "M.Sc" },
  { value: "M.Sc + B.Ed", label: "M.Sc + B.Ed" },
  { value: "B.A + B.Ed", label: "B.A + B.Ed" },
  { value: "M.A + B.Ed", label: "M.A + B.Ed" },
  { value: "MBA", label: "MBA" },
  { value: "B.Com + B.Ed", label: "B.Com + B.Ed" },
  { value: "Ph.D", label: "Ph.D" },
];
export const TYPE_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];
export const SALARY_OPTIONS = [
  { value: "₹10K–₹15K", label: "₹10,000 – ₹15,000" },
  { value: "₹15K–₹20K", label: "₹15,000 – ₹20,000" },
  { value: "₹18K–₹24K", label: "₹18,000 – ₹24,000" },
  { value: "₹20K–₹30K", label: "₹20,000 – ₹30,000" },
  { value: "₹25K–₹35K", label: "₹25,000 – ₹35,000" },
  { value: "₹30K–₹45K", label: "₹30,000 – ₹45,000" },
  { value: "₹40K–₹60K", label: "₹40,000 – ₹60,000" },
  { value: "₹50K–₹70K", label: "₹50,000 – ₹70,000" },
  { value: "₹60K–₹80K", label: "₹60,000 – ₹80,000" },
  { value: "₹80K–₹1L", label: "₹80,000 – ₹1,00,000" },
  { value: "₹1L+", label: "1,00,000+" },
];

export const CATEGORY_OPTIONS = [
  { value: "Academic Positions", label: "Academic Positions" },
  { value: "Administrative Positions", label: "Administrative Positions" },
  { value: "Operations & Support Positions", label: "Operations & Support Positions" },
];

export const SKILLS_LIST = [
  "Curriculum Development",
  "Classroom Management",
  "Student Assessment",
  "Communication",
  "Leadership",
  "Team Collaboration",
  "Microsoft Office",
  "Data Analysis",
  "Project Management",
  "Problem Solving",
  "CBSE Curriculum",
  "Digital Literacy",
  "Research & Development",
  "Counselling",
  "Event Management",
  "Administration",
  "IT Support",
  "Sports Coaching",
  "Content Creation",
  "Public Speaking",
];
