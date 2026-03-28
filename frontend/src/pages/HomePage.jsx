import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { internshipAPI } from '../services/api';
import InternshipCard from '../components/InternshipCard';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    internshipAPI.getAll({ page: 0, size: 6 })
      .then(res => setFeatured(res.data.content || []))
      .catch(() => {});
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center hero-bg overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center page-enter">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 text-sm text-gray-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {featured.length > 0 ? `${featured.length}+ internships available` : 'Find your dream internship'}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Launch your career{' '}
            <span className="gradient-text">the smart way</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover internships matched to your skills and goals. Get personalized recommendations 
            powered by intelligent matching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/internships" className="btn-primary text-base px-8 py-4">
              Browse Internships
            </Link>
            {isAuthenticated ? (
              <Link to="/recommendations" className="btn-outline text-base px-8 py-4">
                Get Recommendations
              </Link>
            ) : (
              <Link to="/register" className="btn-outline text-base px-8 py-4">
                Create Account
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { n: '500+', label: 'Internships' },
              { n: '200+', label: 'Companies' },
              { n: '10k+', label: 'Students' },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{n}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title text-white">Latest Opportunities</h2>
              <p className="text-gray-400 mt-2">Freshly posted internships</p>
            </div>
            <Link to="/internships" className="btn-outline text-sm">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(internship => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="glass-card p-12 text-center"
             style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.10) 100%)' }}>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your internship?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Create a free account and get personalized internship recommendations based on your skills.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/recommendations" className="btn-primary">Get Recommendations</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Get Started — Free</Link>
                <Link to="/login" className="btn-outline">Log in</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
