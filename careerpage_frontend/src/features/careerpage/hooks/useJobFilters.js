import { useMemo, useState, useEffect } from "react";
import { api } from "../../../lib/api";

const JOBS_VISIBLE = 4;

export function useJobFilters() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Positions");
  const [showAll, setShowAll] = useState(false);
  const [jobsList, setJobsList] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.get("/job-postings/public/");
        const list = data.results ? data.results : data;
        const translated = list.map(jp => ({
          id: jp.id,
          title: jp.role,
          category: jp.category || "General",
          department: jp.department || "General",
          location: jp.location || "Guwahati, Assam",
          type: jp.type || "Full-time",
          experience: jp.experience || "Not specified",
          salary: jp.salary_range || "Not disclosed",
          qualifications: Array.isArray(jp.qualifications) ? jp.qualifications : (jp.qualification ? [jp.qualification] : ["Degree in relevant field"]),
          description: jp.description || "",
          educationalQualifications: jp.educational_qualifications || "",
          skillsRequired: jp.skills_required || "",
        }));
        setJobsList(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(translated)) {
            return translated;
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to load public jobs", err);
      }
    };
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = useMemo(() => {
    return jobsList.filter((j) => {
      const matchesCategory =
        activeCategory === "All Positions" || j.category === activeCategory;
      const matchesSearch =
        search === "" ||
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [jobsList, search, activeCategory]);

  const visibleJobs = showAll ? filteredJobs : filteredJobs.slice(0, JOBS_VISIBLE);

  const onSearchChange = (value) => {
    setSearch(value);
    setShowAll(false);
  };

  const onCategoryChange = (cat) => {
    setActiveCategory(cat);
    setShowAll(false);
  };

  return {
    search,
    activeCategory,
    showAll,
    setShowAll,
    filteredJobs,
    visibleJobs,
    onSearchChange,
    onCategoryChange,
    JOBS_VISIBLE,
  };
}
