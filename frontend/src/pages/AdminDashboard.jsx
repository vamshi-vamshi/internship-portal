import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../services/api";

const STATUS_STYLES = {
  APPLIED:     "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  SHORTLISTED: "bg-green-500/15  text-green-400  border border-green-500/30",
  REJECTED:    "bg-red-500/15    text-red-400    border border-red-500/30",
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab]             = useState('internships');
  const [internships, setInternships] = useState([]);
  const [users, setUsers]         = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [deleteId, setDeleteId]   = useState(null);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch { /* non-critical */ }
  }, []);

  const fetchTab = useCallback(async (t, p = 0) => {
    setLoading(true);
    setError("");
    try {
      if (t === 'internships') {
        const res = await adminAPI.listInternships({ page: p, size: 10 });
        setInternships(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else if (t === 'users') {
        const res = await adminAPI.getAllUsers({ page: p, size: 20 });
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 0);
      } else if (t === 'applications') {
        const res = await adminAPI.getAllApplications({ page: p, size: 20 });
        setApplications(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
      setPage(p);
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTab(tab, 0); }, [tab, fetchTab]);

  const handleDeleteInternship = async (id) => {
    try {
      await adminAPI.delete(id);
      setDeleteId(null);
      fetchTab('internships', page);
      fetchStats();
    } catch {
      setError("Failed to delete internship.");
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await adminAPI.updateApplicationStatus(appId, status);
      // Optimistic update
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      fetchStats();
    } catch {
      setError("Failed to update status.");
    }
  };

  const TABS = [
    { id: 'internships',  label: '📋 Internships' },
    { id: 'users',        label: '👥 Users' },
    { id: 'applications', label: '📨 Applications' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage internships, users, and applications</p>
          </div>
          <Link to="/admin/internships/new" className="btn-primary">+ New Internship</Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Users"    value={stats.totalUsers}          icon="👤" color="bg-blue-500/20" />
            <StatCard label="Applications"   value={stats.totalApplications}   icon="📨" color="bg-purple-500/20" />
            <StatCard label="Pending"        value={stats.pendingApplications}  icon="🟡" color="bg-yellow-500/20" />
            <StatCard label="Shortlisted"    value={stats.approvedApplications} icon="🟢" color="bg-green-500/20" />
            <StatCard label="Rejected"       value={stats.rejectedApplications} icon="🔴" color="bg-red-500/20" />
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Internships tab */}
        {tab === 'internships' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr className="text-gray-400 text-left">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3 hidden md:table-cell">Company</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Location</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Stipend</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-500">Loading…</td></tr>
                  ) : internships.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-500">No internships found.</td></tr>
                  ) : internships.map(i => (
                    <tr key={i.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{i.title}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{i.company}</td>
                      <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{i.location}</td>
                      <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                        {i.stipend ? `₹${i.stipend}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/internships/edit/${i.id}`}
                            className="px-3 py-1 rounded-lg text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500/30 transition-colors">
                            Edit
                          </Link>
                          <Link to={`/admin/internships/${i.id}/applicants`}
                            className="px-3 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                            Applicants
                          </Link>
                          <button onClick={() => setDeleteId(i.id)}
                            className="px-3 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr className="text-gray-400 text-left">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 hidden md:table-cell">Applications</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-500">Loading…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-500">No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {u.applicationCount ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications tab */}
        {tab === 'applications' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr className="text-gray-400 text-left">
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3 hidden md:table-cell">Internship</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Applied</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-500">Loading…</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-500">No applications yet.</td></tr>
                  ) : applications.map(a => (
                    <tr key={a.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                        <p className="text-white">{a.internshipTitle}</p>
                        <p className="text-xs text-gray-500">{a.internshipCompany}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                        {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status] || ''}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {a.status !== 'SHORTLISTED' && (
                            <button onClick={() => handleStatusChange(a.id, 'SHORTLISTED')}
                              className="px-2 py-1 rounded-lg text-xs bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                              Approve
                            </button>
                          )}
                          {a.status !== 'REJECTED' && (
                            <button onClick={() => handleStatusChange(a.id, 'REJECTED')}
                              className="px-2 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                              Reject
                            </button>
                          )}
                          {a.status !== 'APPLIED' && (
                            <button onClick={() => handleStatusChange(a.id, 'APPLIED')}
                              className="px-2 py-1 rounded-lg text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors">
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => fetchTab(tab, page - 1)} disabled={page === 0}
              className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
            <span className="flex items-center text-gray-400 text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={() => fetchTab(tab, page + 1)} disabled={page >= totalPages - 1}
              className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next →</button>
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-card p-6 max-w-sm mx-4">
              <h3 className="text-white font-semibold text-lg mb-2">Delete Internship?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will permanently delete the internship and all its applications.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteId(null)} className="btn-outline px-4 py-2 text-sm">
                  Cancel
                </button>
                <button onClick={() => handleDeleteInternship(deleteId)} className="btn-danger px-4 py-2 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
