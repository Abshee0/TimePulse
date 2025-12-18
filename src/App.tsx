import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'
import EmployeesPage from './pages/EmployeesPage';
import AttendanceDownloadPage from './pages/AttendanceDownloadPage';
import AttendanceUploadPage from './pages/AttendanceUploadPage';
import AttendanceView from './pages/AttendanceViewPage';
import DutyRosterPage from './pages/DutyRosterPage';
import DutyRosterView from './pages/DutyRosterView'
import DownloadDutyRosterPage from './pages/DownloadDutyRosterPage';
import LeaveManager from './pages/LeaveManager'
import CalendarView from './pages/CalendarView'
import SettingsPage from './pages/SettingsPage';
import RosterManagementPage from './pages/RosterManagementPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={() => {}} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Sidebar />
            <main className="ml-64 min-h-screen bg-gray-100 p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/attendance-download" element={<AttendanceDownloadPage />} />
                <Route path="/attendance-upload" element={<AttendanceUploadPage />} />
                <Route path="/attendance-view" element={<AttendanceView />} />
                <Route path="/duty-roster" element={<DutyRosterPage />} />
                <Route path="/duty-roster-view" element={<DutyRosterView />} />
                <Route path="/download-duty-roster" element={<DownloadDutyRosterPage />} />
                <Route path="/leave-manager" element={<LeaveManager />} />
                <Route path="/calendar-view" element={<CalendarView />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/roster-management" element={<RosterManagementPage />} />
              </Routes>
            </main>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;