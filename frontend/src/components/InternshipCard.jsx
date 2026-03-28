import { Link } from 'react-router-dom';

const COMPANY_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-amber-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500',
];

function getColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

export default function InternshipCard({ internship, adminMode, onEdit, onDelete }) {
  const color = getColor(internship.company || '');
  const initials = (internship.company || 'C').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="internship-card group flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white text-base leading-tight truncate group-hover:text-brand-300 transition-colors">
            {internship.title}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">{internship.company}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-400">
        {internship.location && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {internship.location}
          </span>
        )}
        {internship.stipend && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {internship.stipend}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {internship.minExperience === 0 ? 'Freshers OK' : `${internship.minExperience}+ yrs`}
        </span>
      </div>

      {/* Skills */}
      {internship.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {internship.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-badge">{skill}</span>
          ))}
          {internship.skills.length > 4 && (
            <span className="skill-badge">+{internship.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-white/8 flex gap-2">
        {adminMode ? (
          <>
            <button onClick={onEdit}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-brand-300 border border-brand-500/30 hover:bg-brand-500/10 transition-all">
              Edit
            </button>
            <button onClick={onDelete}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all">
              Delete
            </button>
          </>
        ) : (
          <>
            <Link to={`/internships/${internship.id}`}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-gray-300 border border-white/15 hover:bg-white/8 transition-all">
              Details
            </Link>
            {internship.companyApplicationLink && (
              <a href={internship.companyApplicationLink} target="_blank" rel="noopener noreferrer"
                 className="flex-1 py-2 rounded-lg text-sm font-semibold text-center bg-brand-600 hover:bg-brand-500 text-white transition-all">
                Apply →
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
