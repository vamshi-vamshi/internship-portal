import { useState } from 'react';

export default function FilterBar({ onFilter, initialValues = {} }) {
  const [skills, setSkills] = useState(initialValues.skills || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [experience, setExperience] = useState(initialValues.maxExperience ?? '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({
      skills: skills.trim() || undefined,
      location: location.trim() || undefined,
      maxExperience: experience !== '' ? Number(experience) : undefined,
    });
  };

  const handleClear = () => {
    setSkills(''); setLocation(''); setExperience('');
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Skills</label>
          <input
            type="text"
            className="input-dark"
            placeholder="e.g. React, Node.js, Python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Location</label>
          <input
            type="text"
            className="input-dark"
            placeholder="e.g. Hyderabad, Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Max Experience (yrs)</label>
          <select
            className="input-dark"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">Any</option>
            <option value="0">Fresher (0 yrs)</option>
            <option value="1">Up to 1 year</option>
            <option value="2">Up to 2 years</option>
            <option value="3">Up to 3 years</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button type="submit" className="btn-primary">
          Search Internships
        </button>
        <button type="button" onClick={handleClear} className="btn-outline">
          Clear
        </button>
      </div>
    </form>
  );
}
