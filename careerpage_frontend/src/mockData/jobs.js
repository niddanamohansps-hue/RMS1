import {
  GraduationCap,
  Heart,
  Shield,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

// Static career-portal content. This is the seam where a real API/backend
// will eventually plug in — components import from here, not inline literals.

export const CATEGORIES = [
  "All Positions",
  "Academic Positions",
  "Administrative Positions",
  "Operations & Support Positions",
];

export const jobs = [
  {
    id: 1,
    title: "Senior Mathematics Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "July 15, 2026",
    description:
      "We are looking for an experienced Mathematics teacher to join our secondary school team. The ideal candidate should be passionate about teaching and have a strong command of the subject.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "Master's degree in Mathematics or related field",
      "B.Ed or equivalent teaching certification",
      "Experience in CBSE curriculum",
    ],
  },
  {
    id: 2,
    title: "English Language & Literature Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "July 20, 2026",
    description:
      "Teach English literature and language skills to secondary students, foster critical thinking and expressive writing across all levels.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "Degree in English Literature or Linguistics",
      "B.Ed or equivalent teaching certification",
      "Strong communication and writing skills",
    ],
  },
  {
    id: 3,
    title: "Physics Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "July 18, 2026",
    description:
      "Deliver engaging physics lessons from foundational to advanced levels, guide students through experiments and STEM competitions.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "M.Sc in Physics or related field",
      "B.Ed or equivalent teaching certification",
      "Experience with lab instruction",
    ],
  },
  {
    id: 4,
    title: "School Counsellor",
    department: "Student Welfare",
    type: "Full-time",
    category: "Administrative Positions",
    location: "Guwahati, Assam",
    deadline: "July 25, 2026",
    description:
      "Support students' emotional and academic well-being, coordinate with parents and teachers to nurture a positive school environment.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "Degree in Psychology or Counselling",
      "Certification in school counselling",
      "Strong interpersonal and empathy skills",
    ],
  },
  {
    id: 5,
    title: "Computer Science Teacher",
    department: "Academic Department",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "August 1, 2026",
    description:
      "Teach programming, computational thinking, and digital literacy; lead the school's coding clubs and technology initiatives.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "Degree in Computer Science or IT",
      "B.Ed or equivalent teaching certification",
      "Proficiency in Python, Java, or web technologies",
    ],
  },
  {
    id: 6,
    title: "Physical Education Teacher",
    department: "Sports & Wellness",
    type: "Full-time",
    category: "Academic Positions",
    location: "Guwahati, Assam",
    deadline: "August 5, 2026",
    description:
      "Develop and implement physical education programs, coach school sports teams, and promote overall student wellness.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "Degree in Physical Education or Sports Science",
      "Coaching certification preferred",
      "Experience with school-level sports programs",
    ],
  },
  {
    id: 7,
    title: "Academic Coordinator",
    department: "Administration",
    type: "Full-time",
    category: "Administrative Positions",
    location: "Guwahati, Assam",
    deadline: "August 10, 2026",
    description:
      "Oversee curriculum planning and coordination across departments, liaise between faculty and school leadership to ensure academic quality.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "Postgraduate degree in Education",
      "Minimum 5 years teaching or admin experience",
      "Strong organisational and leadership skills",
    ],
  },
  {
    id: 8,
    title: "Office Administrator",
    department: "Administration",
    type: "Full-time",
    category: "Administrative Positions",
    location: "Guwahati, Assam",
    deadline: "August 12, 2026",
    description:
      "Manage day-to-day office operations, maintain school records, coordinate communications between staff, parents, and management.",
    skills: ["Strong Communication", "Classroom Management", "Team Collaboration"],
    qualifications: [
      "Degree in Business Administration or related",
      "Proficiency in MS Office and school ERP",
      "Strong written and verbal communication",
    ],
  },
];

// Approximate experience range shown per job card, keyed by job id.
export const experienceById = {
  1: "3–5 yrs",
  2: "2–5 yrs",
  3: "3–6 yrs",
  4: "2–4 yrs",
  5: "1–3 yrs",
  6: "2–5 yrs",
  7: "5–8 yrs",
  8: "2–4 yrs",
  9: "4–7 yrs",
  10: "1–3 yrs",
};

export const salaryRangeById = {
  1: "40k – 60k",
  2: "35k – 50k",
  3: "40k – 55k",
  4: "30k – 45k",
  5: "35k – 50k",
  6: "30k – 45k",
  7: "50k – 70k",
  8: "25k – 40k",
  9: "45k – 65k",
  10: "25k – 40k",
};

export const benefits = [
  {
    icon: GraduationCap,
    title: "Continuous Learning",
    desc: "Funded professional development, workshops, and advanced degree support to keep you at the forefront of education.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    desc: "Comprehensive medical coverage for you and your family, plus access to our on-campus wellness facilities.",
  },
  {
    icon: Shield,
    title: "Job Security",
    desc: "Stable employment in a respected institution with transparent appraisal processes and long-term career pathways.",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    desc: "Work alongside dedicated educators in a supportive environment where ideas are shared and collaboration thrives.",
  },
  {
    icon: TrendingUp,
    title: "Career Advancement",
    desc: "Structured growth paths from teacher to department head, academic coordinator, and leadership roles.",
  },
  {
    icon: Award,
    title: "Recognition & Rewards",
    desc: "Annual awards celebrating outstanding educators, performance bonuses, and public recognition of achievements.",
  },
];

export const milestones = [
  {
    year: "1960",
    event:
      "South Point School founded with a vision to redefine educational excellence in Guwahati, Assam.",
  },
  {
    year: "1975",
    event:
      "First batch of students achieves distinction in ICSE board examinations, establishing academic legacy.",
  },
  {
    year: "1990",
    event:
      "Expansion of campus and introduction of modern science laboratories and library infrastructure.",
  },
  {
    year: "2005",
    event:
      "Recognition as one of the top schools in West Bengal for academic and extracurricular excellence.",
  },
  {
    year: "2015",
    event:
      "Launch of digital learning initiatives and integration of technology across all departments.",
  },
  {
    year: "2024",
    event:
      "Over 60 years of shaping generations of scholars, leaders, and innovators across disciplines.",
  },
];

export const stats = [
  { value: "94%", label: "Employee Satisfaction" },
  { value: "320+", label: "Staff Members" },
  { value: "9 Years", label: "Avg. Employee Tenure" },
  { value: "64+", label: "Years of Excellence" },
];
