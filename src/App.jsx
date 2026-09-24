import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/Auth-Context';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/vibe/AppLayout';
import Feed from '@/pages/Feed';
import Profile from '@/pages/Profile';
import Search from '@/pages/Search';
import Messages from '@/pages/Messages';
import Thread from '@/pages/Thread';
import Notifications from '@/pages/Notifications';
import UserProfile from '@/pages/UserProfile';
import Settings from '@/pages/Settings';
import SettingsDetail from '@/pages/SettingsDetail';
import Debug from '@/pages/Debug';
import { applyTheme, savedTheme } from '@/lib/theme';


// 1. IMPORT YOUR FIRESTORE DATABASE INSTANCE HERE
// Note: If your firebase.js file is in your 'src' root, use './firebase'.
// If it is inside 'src/lib', change this to '@/lib/firebase' or './lib/firebase'.
import { db } from '@/lib/firebase';


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Feed />} />
          <Route path="/search" element={<Search />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/:key" element={<SettingsDetail />} />
          <Route path="/debug" element={<Debug />} />
        </Route>
        <Route path="/messages/:id" element={<Thread />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  useEffect(() => {
    // 2. LOG THE DATABASE CONNECTION WHEN THE APP LOADS
    console.log("Firebase DB initialized successfully:", db);

    applyTheme(savedTheme());
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
