import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CheckInPage from './pages/CheckInPage';
import SuggestionsPage from './pages/SuggestionsPage';
import TeamInsightsPage from './pages/TeamInsightsPage';
import MeetingOptimizerPage from './pages/MeetingOptimizerPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard"   element={<DashboardPage />} />
              <Route path="/checkin"     element={<CheckInPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/calendar"    element={<MeetingOptimizerPage />} />
              <Route path="/settings"    element={<SettingsPage />} />
            </Route>

            {/* Manager-only */}
            <Route element={<PrivateRoute requiredRole="manager" />}>
              <Route path="/team" element={<TeamInsightsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
