import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import InternshipListPage from "./pages/InternshipListPage";
import InternshipDetailsPage from "./pages/InternshipDetailsPage";
import RecommendationPage from "./pages/RecommendationPage";
import AdminDashboard from "./pages/AdminDashboard";
import InternshipFormPage from "./pages/InternshipFormPage";
import ViewApplicantsPage from "./pages/ViewApplicantsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-10 h-10" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/login"      element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"   element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/admin/login" element={<GuestRoute><AdminLoginPage /></GuestRoute>} />
        <Route path="/internships"     element={<InternshipListPage />} />
        <Route path="/internships/:id" element={<InternshipDetailsPage />} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute><MyApplicationsPage /></ProtectedRoute>} />
        {/* Admin */}
        <Route path="/admin"                              element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/internships/new"              element={<ProtectedRoute adminOnly><InternshipFormPage /></ProtectedRoute>} />
        <Route path="/admin/internships/edit/:id"         element={<ProtectedRoute adminOnly><InternshipFormPage /></ProtectedRoute>} />
        <Route path="/admin/internships/:id/applicants"   element={<ProtectedRoute adminOnly><ViewApplicantsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* AI Chatbot - shown after login */}
      <Chatbot />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
