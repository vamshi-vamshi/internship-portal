import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { internshipAPI } from "../services/api";
import InternshipCard from "../components/InternshipCard";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

export default function InternshipListPage() {
  const [internships, setInternships] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    skills: searchParams.get("skills") || "",
    location: searchParams.get("location") || "",
    maxExperience: searchParams.get("maxExperience") || "",
    page: parseInt(searchParams.get("page") || "0"),
  };

  const fetchInternships = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page: filters.page, size: 9 };
      if (filters.skills) params.skills = filters.skills;
      if (filters.location) params.location = filters.location;
      if (filters.maxExperience) params.maxExperience = filters.maxExperience;
      const res = await internshipAPI.getAll(params);
      setInternships(res.data.content || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements,
      });
    } catch {
      setError("Failed to load internships. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInternships(); }, [searchParams]);

  const handleFilter = (newFilters) => {
    const p = { page: "0" };
    if (newFilters.skills) p.skills = newFilters.skills;
    if (newFilters.location) p.location = newFilters.location;
    if (newFilters.maxExperience) p.maxExperience = newFilters.maxExperience;
    setSearchParams(p);
  };

  const handlePage = (page) => {
    const p = Object.fromEntries(searchParams.entries());
    p.page = String(page);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Internships</h1>
          <p className="text-slate-400">
            {!loading && `${pagination.totalElements} opportunities available`}
          </p>
        </div>

        <FilterBar initialFilters={filters} onFilter={handleFilter} />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-400 mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner w-10 h-10" />
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No internships found</h3>
            <p className="text-slate-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {internships.map((i) => <InternshipCard key={i.id} internship={i} />)}
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePage}
            />
          </>
        )}
      </div>
    </div>
  );
}
