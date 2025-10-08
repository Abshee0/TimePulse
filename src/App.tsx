import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, FileSpreadsheet, Upload, BarChart, Calendar, Download, Settings, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendanceDownloadPage from './pages/AttendanceDownloadPage';
import AttendanceUploadPage from './pages/AttendanceUploadPage';
import AttendanceView from './pages/AttendanceViewPage';
import DutyRosterPage from './pages/DutyRosterPage';
import DownloadDutyRosterPage from './pages/DownloadDutyRosterPage';
import SettingsPage from './pages/SettingsPage';

function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const menuItems = [
    { path: '/', label: 'Employees', icon: Users },
    { path: '/attendance-view', label: 'View Attendance', icon: BarChart },
    { path: '/attendance-upload', label: 'Upload Attendance', icon: Upload },
    { path: '/attendance-download', label: 'Download Attendance', icon: FileSpreadsheet },
    { path: '/duty-roster', label: 'Duty Roster', icon: Calendar },
    { path: '/download-duty-roster', label: 'Download Duty Roster', icon: Download },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Staff Portal</h2>
        {user?.email && (
          <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
        )}
      </div>
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

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
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <main className="flex-1 p-8">
                <Routes>
                  <Route path="/" element={<EmployeesPage />} />
                  <Route path="/attendance-download" element={<AttendanceDownloadPage />} />
                  <Route path="/attendance-upload" element={<AttendanceUploadPage />} />
                  <Route path="/attendance-view" element={<AttendanceView />} />
                  <Route path="/duty-roster" element={<DutyRosterPage />} />
                  <Route path="/download-duty-roster" element={<DownloadDutyRosterPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </main>
            </div>
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