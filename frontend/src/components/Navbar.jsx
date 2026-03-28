import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors ${
        isActive(to) ? "text-brand-400" : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            IM
          </div>
          <span className="gradient-text hidden sm:block">InternMatch</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink("/internships", "Internships")}
          {isAuthenticated && !isAdmin && navLink("/recommendations", "Recommendations")}
          {isAuthenticated && !isAdmin && navLink("/my-applications", "My Applications")}
          {isAdmin && navLink("/admin", "Dashboard")}
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-400">
                Hi, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span>
                {isAdmin && <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">Admin</span>}
              </span>
              <button onClick={handleLogout} className="btn-outline py-2 px-4 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign in</Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-4 px-2">
          <Link to="/internships" onClick={() => setMenuOpen(false)} className="text-sm text-gray-300 hover:text-white">Internships</Link>
          {isAuthenticated && !isAdmin && (
            <>
              <Link to="/recommendations" onClick={() => setMenuOpen(false)} className="text-sm text-gray-300 hover:text-white">Recommendations</Link>
              <Link to="/my-applications" onClick={() => setMenuOpen(false)} className="text-sm text-gray-300 hover:text-white">My Applications</Link>
            </>
          )}
          {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-gray-300 hover:text-white">Dashboard</Link>}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-sm text-red-400 text-left">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-gray-300 hover:text-white">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm text-brand-400 font-medium">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
