import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from './router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/navbar/Navbar';
import { Sidebar } from './components/sidebar/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CalendarPage } from './pages/CalendarPage';
import { AccountsPage } from './pages/AccountsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { RefreshCw, CheckCircle2 } from 'lucide-react';


// Handles oauth_success or oauth_error from server-side Meta OAuth callback
const MetaOAuthCallback = ({ onDone }) => {
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success')) {
      showToast('🎉 Meta account connected successfully!', 'success');
    } else if (params.get('oauth_error')) {
      const err = params.get('oauth_error');
      if (err === 'no_pages') {
        showToast('No Facebook Pages found. Please create a Facebook Page first.', 'error');
      } else {
        showToast(`Meta connection failed: ${err}`, 'error');
      }
    }
    // Clean URL params
    window.history.replaceState(null, '', window.location.pathname);
    onDone();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-semibold space-y-3">
      <RefreshCw className="w-9 h-9 animate-spin text-[#ef6111]" />
      <p className="text-xs">Finalizing Meta Account Connection...</p>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [handlingOAuth, setHandlingOAuth] = useState(false);

  // Detect Meta OAuth redirect (URL search params have oauth_success or oauth_error)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success') || params.get('oauth_error')) {
      setHandlingOAuth(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && !handlingOAuth) {
      if (!isAuthenticated && pathname !== '/login') {
        navigate('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/')) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, navigate, handlingOAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-semibold space-y-3">
        <RefreshCw className="w-9 h-9 animate-spin text-[#ef6111]" />
        <p className="text-xs">Initializing Meta AutoPost Engine...</p>
      </div>
    );
  }

  // Handle Meta OAuth callback (server-side redirect)
  if (handlingOAuth && isAuthenticated) {
    return (
      <MetaOAuthCallback onDone={() => {
        setHandlingOAuth(false);
        navigate('/accounts');
      }} />
    );
  }

  if (pathname === '/privacy') {
    return <PrivacyPage />;
  }

  if (pathname === '/terms') {
    return <TermsPage />;
  }

  if (!isAuthenticated || pathname === '/login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1 bg-slate-50">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full bg-slate-50">
          {(pathname === '/' || pathname === '/dashboard') && <DashboardPage />}
          {pathname === '/create' && <CreatePostPage />}
          {pathname === '/calendar' && <CalendarPage />}
          {pathname === '/accounts' && <AccountsPage />}
          {pathname.startsWith('/admin') && <AdminUsersPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
