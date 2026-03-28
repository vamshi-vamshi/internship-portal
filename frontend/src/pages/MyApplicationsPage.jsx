import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../services/api";

const STATUS_STYLES = {
  APPLIED:     { badge: "bg-blue-500/20 text-blue-300",  icon: "📋", label: "Applied" },
  SHORTLISTED: { badge: "bg-green-500/20 text-green-300", icon: "✅", label: "Shortlisted" },
  REJECTED:    { badge: "bg-red-500/20 text-red-300",    icon: "❌", label: "Rejected" },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const fetchApplications = async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const res = await userAPI.getMyApplications({ page: p, size: 10 });
      setApplications(res.data.content || []);
      setPagination({ totalElements: res.data.totalElements, totalPages: res.data.totalPages });
    } catch {
      setError("Failed to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(page); }, [page]);

  const counts = {
    total:       applications.length,
    shortlisted: applications.filter(a => a.status === "SHORTLISTED").length,
    rejected:    applications.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-slate-400 text-sm">{pagination.totalElements} total application{pagination.totalElements !== 1 ? "s" : ""}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Applied",      value: pagination.totalElements, color: "from-indigo-500 to-purple-500", icon: "📋" },
            { label: "Shortlisted",  value: counts.shortlisted,       color: "from-green-500 to-emerald-500", icon: "✅" },
            { label: "Rejected",     value: counts.rejected,          color: "from-red-500 to-pink-500",      icon: "❌" },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="glass-card rounded-2xl px-5 py-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-base mb-2`}>{icon}</div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-400 mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-2xl">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
            <p className="text-slate-400 text-sm mb-6">Start applying to internships to track them here.</p>
            <Link to="/internships" className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm inline-block">
              Browse Internships →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((a) => {
              const s = STATUS_STYLES[a.status] || STATUS_STYLES.APPLIED;
              return (
                <div key={a.id} className="glass-card rounded-2xl px-6 py-5 flex items-center gap-5">
                  {/* Company avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {a.internshipCompany?.charAt(0) || "?"}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link to={`/internships/${a.internshipId}`}
                          className="text-white font-semibold hover:text-indigo-400 transition-colors">
                          {a.internshipTitle}
                        </Link>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {a.internshipCompany}
                          {a.internshipLocation && <span className="mx-1.5 text-slate-600">·</span>}
                          {a.internshipLocation}
                        </p>
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${s.badge}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Applied {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      }) : "—"}</span>
                      {a.resumeLink && (
                        <a href={a.resumeLink} target="_blank" rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 transition-colors">
                          📄 Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${i === page ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/10"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
