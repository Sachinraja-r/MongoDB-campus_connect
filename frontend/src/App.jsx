import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailPage } from './pages/ClubDetailPage';
import { FriendsPage } from './pages/FriendsPage';
import { CampusMapPage } from './pages/CampusMapPage';
import { PresencePage } from './pages/PresencePage';
import { MentorDashboard } from './pages/MentorDashboard';
import { ClubAdminDashboard } from './pages/ClubAdminDashboard';
import { CmsDashboard } from './pages/CmsDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-kiot-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'developer') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Login */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/clubs/:id" element={<ClubDetailPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/map" element={<CampusMapPage />} />
            <Route path="/presence" element={<PresencePage />} />

            {/* Mentor Scoped Dashboard */}
            <Route
              path="/mentor"
              element={
                <ProtectedRoute allowedRoles={['mentor', 'faculty', 'admin', 'developer']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Club Admin Dashboard */}
            <Route
              path="/club-admin"
              element={
                <ProtectedRoute allowedRoles={['club_admin', 'admin', 'developer']}>
                  <ClubAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Developer CMS (System Control Center) */}
            <Route
              path="/cms"
              element={
                <ProtectedRoute allowedRoles={['admin', 'developer']}>
                  <CmsDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
