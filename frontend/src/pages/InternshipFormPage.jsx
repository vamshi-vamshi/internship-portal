import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { adminAPI, internshipAPI } from "../services/api";

const EMPTY = { title: "", company: "", description: "", location: "", skills: "", minExperience: "", stipend: "", companyApplicationLink: "" };

export default function InternshipFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    internshipAPI.getById(id)
      .then(res => {
        const d = res.data;
        setForm({
          title: d.title || "",
          company: d.company || "",
          description: d.description || "",
          location: d.location || "",
          skills: d.skills || "",
          minExperience: d.minExperience ?? "",
          stipend: d.stipend ?? "",
          companyApplicationLink: d.companyApplicationLink || "",
        });
      })
      .catch(() => setError("Failed to load internship."))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, minExperience: Number(form.minExperience) || 0, stipend: Number(form.stipend) || 0 };
      if (isEdit) await adminAPI.update(id, payload);
      else await adminAPI.create(payload);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save internship.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "title", label: "Job Title", placeholder: "e.g. Frontend Developer Intern", required: true },
    { name: "company", label: "Company Name", placeholder: "e.g. Google, Infosys", required: true },
    { name: "location", label: "Location", placeholder: "e.g. Bangalore, Remote", required: true },
    { name: "skills", label: "Required Skills", placeholder: "e.g. React, Node.js, Python (comma-separated)", required: true },
    { name: "companyApplicationLink", label: "Application Link", placeholder: "https://company.com/careers/apply", type: "url", required: true },
    { name: "minExperience", label: "Min Experience (years)", placeholder: "0", type: "number" },
    { name: "stipend", label: "Stipend (₹/month)", placeholder: "e.g. 15000", type: "number" },
  ];

  if (fetchLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Dashboard
        </Link>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">{isEdit ? "Edit Internship" : "Add New Internship"}</h1>
          <p className="text-slate-400 text-sm mb-8">{isEdit ? "Update the internship details below." : "Fill in the details to post a new internship."}</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(({ name, label, placeholder, type = "text", required }) => (
              <div key={name}>
                <label className="block text-sm text-slate-300 mb-1.5">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                <input name={name} type={type} value={form[name]} onChange={handleChange} required={required}
                  placeholder={placeholder} min={type === "number" ? "0" : undefined}
                  className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm" />
              </div>
            ))}

            {/* Description */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what the intern will learn..."
                rows={5} className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <Link to="/admin" className="btn-outline flex-1 py-3 rounded-xl text-sm text-center">Cancel</Link>
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 rounded-xl font-semibold text-sm">
                {loading ? <span className="spinner" /> : (isEdit ? "Save Changes" : "Post Internship")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
