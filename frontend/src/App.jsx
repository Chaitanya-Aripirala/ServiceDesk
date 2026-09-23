import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { TicketList } from './pages/tickets/TicketList';
import { TicketCreate } from './pages/tickets/TicketCreate';
import { TicketDetail } from './pages/tickets/TicketDetail';
import { AssetList } from './pages/assets/AssetList';
import { AssetDetail } from './pages/assets/AssetDetail';
import { AssetCreate } from './pages/assets/AssetCreate';
import { KnowledgeBase } from './pages/knowledge/KnowledgeBase';
import { ArticleDetail } from './pages/knowledge/ArticleDetail';
import { ArticleEditor } from './pages/knowledge/ArticleEditor';
import { AdminConsole } from './pages/admin/AdminConsole';
import { Reports } from './pages/reports/Reports';
import { Sparkles } from 'lucide-react';

// Protected Route Guard
const ProtectedLayout = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16' }}>
        <Sparkles size={32} className="animate-spin" color="#6366f1" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Core Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          {/* Ticket Routes */}
          <Route
            path="/tickets"
            element={
              <ProtectedLayout>
                <TicketList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedLayout>
                <TicketCreate />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedLayout>
                <TicketDetail />
              </ProtectedLayout>
            }
          />

          {/* Asset Routes */}
          <Route
            path="/assets"
            element={
              <ProtectedLayout>
                <AssetList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/assets/new"
            element={
              <ProtectedLayout>
                <AssetCreate />
              </ProtectedLayout>
            }
          />
          <Route
            path="/assets/:id"
            element={
              <ProtectedLayout>
                <AssetDetail />
              </ProtectedLayout>
            }
          />

          {/* Knowledge Base Routes */}
          <Route
            path="/knowledge"
            element={
              <ProtectedLayout>
                <KnowledgeBase />
              </ProtectedLayout>
            }
          />
          <Route
            path="/knowledge/new"
            element={
              <ProtectedLayout>
                <ArticleEditor />
              </ProtectedLayout>
            }
          />
          <Route
            path="/knowledge/:id"
            element={
              <ProtectedLayout>
                <ArticleDetail />
              </ProtectedLayout>
            }
          />
          <Route
            path="/knowledge/:id/edit"
            element={
              <ProtectedLayout>
                <ArticleEditor />
              </ProtectedLayout>
            }
          />

          {/* Governance & Admin Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <Reports />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedLayout requiredRole="admin">
                <AdminConsole />
              </ProtectedLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
