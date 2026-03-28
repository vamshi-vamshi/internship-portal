import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { adminAPI, internshipAPI } from "../services/api";

const STATUS_STYLES = {
  APPLIED:     "bg-blue-500/20 text-blue-300",
  SHORTLISTED: "bg-green-500/20 text-green-300",
  REJECTED:    "bg-red-500/20 text-red-300",
};

const STATUS_OPTIONS = ["APPLIED", "SHORTLISTED", "REJECTED"];

export default function ViewApplicantsPage() {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    internshipAPI.getById(id).then(r => setInternship(r.data)).catch(() => {});
  }, [id]);

  const fetchApplicants = async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getApplicants(id, { page: p, size: 20 });
      setApplications(res.data.content || []);
      setPagination({ totalElements: res.data.totalElements, totalPages: res.data.totalPages });
    } catch {
      setError("Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicants(page); }, [id, page]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      const updated = await adminAPI.updateApplicationStatus(applicationId, status);
      setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: updated.data.status } : a));
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-white">{internship?.title || "Applicants"}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Applicants</h1>
            {internship && (
              <p className="text-slate-400 text-sm">
                {internship.title} · {internship.company} · {internship.location || "Remote"}
              </p>
            )}
          </div>
          <div className="glass-card rounded-xl px-5 py-3 text-center">
            <p className="text-2xl font-bold text-white">{pagination.totalElements}</p>
            <p className="text-slate-400 text-xs">Total Applicants</p>
          </div>
        </div>

        {/* Status legend */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <span key={s} className={`px-3 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[s]}`}>{s}</span>
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
            <h3 className="text-xl font-semibold text-white mb-2">No applicants yet</h3>
            <p className="text-slate-400 text-sm">Applications will appear here once users apply.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    {["Applicant", "Email", "Resume", "Applied Date", "Status", "Action"].map(h => (
                      <th key={h} className="px-5 py-4 text-slate-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {a.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{a.email}</td>
                      <td className="px-5 py-4">
                        {a.resumeLink ? (
                          <a href={a.resumeLink} target="_blank" rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 text-xs underline">
                            View Resume →
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs">Not provided</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric"
                        }) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[a.status] || ""}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={a.status}
                          disabled={updatingId === a.id}
                          onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          className="input-dark text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 py-4 border-t border-white/10">
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
