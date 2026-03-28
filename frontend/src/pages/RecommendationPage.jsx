import { useState } from "react";
import { internshipAPI } from "../services/api";
import InternshipCard from "../components/InternshipCard";

export default function RecommendationPage() {
  const [form, setForm] = useState({ skills: "", preferredLocation: "", experienceYears: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const params = {};
      if (form.skills) params.skills = form.skills;
      if (form.preferredLocation) params.preferredLocation = form.preferredLocation;
      if (form.experienceYears) params.experienceYears = form.experienceYears;
      const res = await internshipAPI.getRecommendations(params);
      setResults(res.data.content || []);
    } catch {
      setError("Failed to fetch recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-indigo-400 text-sm font-medium">✨ AI-Powered</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Get Personalized Recommendations</h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm">
            Tell us about your skills and preferences, and we'll match you with the best internships.
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-8 mb-10 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Your Skills</label>
              <input name="skills" value={form.skills} onChange={handleChange} required
                placeholder="e.g. React, Java, Python (comma-separated)"
                className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm" />
              <p className="text-slate-500 text-xs mt-1">Separate multiple skills with commas</p>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Preferred Location <span className="text-slate-500">(optional)</span></label>
              <input name="preferredLocation" value={form.preferredLocation} onChange={handleChange}
                placeholder="e.g. Bangalore, Remote, Delhi"
                className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Years of Experience <span className="text-slate-500">(optional)</span></label>
              <select name="experienceYears" value={form.experienceYears} onChange={handleChange}
                className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm">
                <option value="">Any experience level</option>
                <option value="0">Fresher (0 years)</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3+ years</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-semibold text-sm">
              {loading ? <span className="spinner" /> : "Find My Matches →"}
            </button>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-400 text-center mb-6">{error}</div>
        )}

        {results !== null && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {results.length > 0 ? `${results.length} Match${results.length !== 1 ? "es" : ""} Found` : "No Matches"}
              </h2>
              {results.length > 0 && (
                <span className="text-indigo-400 text-sm">{results.length} internship{results.length !== 1 ? "s" : ""} for you</span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <div className="text-4xl mb-3">🤔</div>
                <h3 className="text-lg font-semibold text-white mb-2">No matches yet</h3>
                <p className="text-slate-400 text-sm">Try different skills or broaden your preferences.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(i => <InternshipCard key={i.id} internship={i} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
