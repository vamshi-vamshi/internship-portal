import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { internshipAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const COLORS = [
  "bg-indigo-500/20 text-indigo-300", "bg-purple-500/20 text-purple-300",
  "bg-pink-500/20 text-pink-300",     "bg-cyan-500/20 text-cyan-300",
  "bg-green-500/20 text-green-300",   "bg-orange-500/20 text-orange-300",
];

export default function InternshipDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: user?.name || "", email: user?.email || "", resumeLink: "" });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    internshipAPI.getById(id)
      .then(res => setInternship(res.data))
      .catch(() => setError("Internship not found."))
      .finally(() => setLoading(false));
  }, [id]);

  // Pre-fill form when user changes
  useEffect(() => {
    if (user) setApplyForm(f => ({ ...f, name: f.name || user.name || "", email: f.email || user.email || "" }));
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError("");
    try {
      await internshipAPI.apply(id, applyForm);
      setApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      setApplyError(err.response?.data?.message || "Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-10 h-10" />
    </div>
  );

  if (error || !internship) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-white mb-2">{error || "Not found"}</h2>
        <Link to="/internships" className="btn-primary px-5 py-2.5 rounded-xl text-sm mt-4 inline-block">Back to Listings</Link>
      </div>
    </div>
  );

  const skills = Array.isArray(internship.skills) ? internship.skills
    : (internship.skills ? internship.skills.split(",").map(s => s.trim()).filter(Boolean) : []);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/internships" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Listings
        </Link>

        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-white/10 px-8 py-8">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {internship.company?.charAt(0) || "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{internship.title}</h1>
                <p className="text-indigo-300 font-semibold text-lg">{internship.company}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-7">
            {/* Meta */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: "📍", label: "Location",       value: internship.location || "Remote" },
                { icon: "🎓", label: "Min Experience", value: `${internship.minExperience || 0} year(s)` },
                { icon: "💰", label: "Stipend",        value: internship.stipend ? `₹${internship.stipend}/month` : "Not disclosed" },
                { icon: "📅", label: "Posted",         value: internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : "—" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-slate-400 text-xs mb-1">{icon} {label}</p>
                  <p className="text-white font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {internship.description && (
              <div>
                <h3 className="text-white font-semibold mb-3">About this Role</h3>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{internship.description}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span key={s} className={`skill-badge ${COLORS[i % COLORS.length]}`}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-2 flex flex-wrap gap-3 items-center">
              {applied ? (
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-6 py-3 rounded-xl font-semibold text-sm border border-green-500/30">
                  ✅ Application Submitted
                </div>
              ) : user ? (
                <button onClick={() => setShowApplyModal(true)}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold">
                  Apply Now →
                </button>
              ) : (
                <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold">
                  Login to Apply →
                </Link>
              )}

              {internship.companyApplicationLink && (
                <a href={internship.companyApplicationLink} target="_blank" rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm">
                  Company Website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Apply for Internship</h2>
                <p className="text-slate-400 text-sm mt-0.5">{internship.title} · {internship.company}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white text-xl leading-none mt-1">✕</button>
            </div>

            {applyError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5 text-red-400 text-sm">{applyError}</div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input value={applyForm.name} onChange={e => setApplyForm({ ...applyForm, name: e.target.value })}
                  required placeholder="Your full name"
                  className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input type="email" value={applyForm.email} onChange={e => setApplyForm({ ...applyForm, email: e.target.value })}
                  required placeholder="you@example.com"
                  className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Resume Link <span className="text-slate-500 text-xs">(optional)</span></label>
                <input type="url" value={applyForm.resumeLink} onChange={e => setApplyForm({ ...applyForm, resumeLink: e.target.value })}
                  placeholder="https://drive.google.com/your-resume"
                  className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm" />
                <p className="text-slate-500 text-xs mt-1">Google Drive, Dropbox, or any public link</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowApplyModal(false)}
                  className="btn-outline flex-1 py-3 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={applying}
                  className="btn-primary flex-1 py-3 rounded-xl font-semibold text-sm">
                  {applying ? <span className="spinner" /> : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
