import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, FileSpreadsheet, Upload, BarChart, Calendar, Download, Settings } from 'lucide-react';
import EmployeesPage from './pages/EmployeesPage';
import AttendanceDownloadPage from './pages/AttendanceDownloadPage';
import AttendanceUploadPage from './pages/AttendanceUploadPage';
import AttendanceView from './pages/AttendanceViewPage';
import DutyRosterPage from './pages/DutyRosterPage';
import DownloadDutyRosterPage from './pages/DownloadDutyRosterPage';
import SettingsPage from './pages/SettingsPage';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Employees', icon: Users },
    { path: '/attendance-view', label: 'View Attendance', icon: BarChart },
    { path: '/attendance-upload', label: 'Upload Attendance', icon: Upload },
    { path: '/attendance-download', label: 'Download Attendance', icon: FileSpreadsheet },
    { path: '/duty-roster', label: 'Duty Roster', icon: Calendar },
    { path: '/download-duty-roster', label: 'Download Duty Roster', icon: Download },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Staff Portal</h2>
      </div>
      <nav className="p-4">
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
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;