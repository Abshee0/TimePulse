import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Users, FileSpreadsheet, Upload, BarChart } from 'lucide-react';
import EmployeesPage from './pages/EmployeesPage';
import AttendanceDownloadPage from './pages/AttendanceDownloadPage';
import AttendanceUploadPage from './pages/AttendanceUploadPage';
import AttendanceView from './pages/AttendanceViewPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Employees
                </Link>
                <Link
                  to="/attendance-view"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <BarChart className="w-5 h-5 mr-2" />
                  View Attendance
                </Link>
                <Link
                  to="/attendance-upload"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Attendance
                </Link>
                <Link
                  to="/attendance-download"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Download Attendance
                </Link>
                
                
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path="/attendance-download" element={<AttendanceDownloadPage />} />
            <Route path="/attendance-upload" element={<AttendanceUploadPage />} />
            <Route path="/attendance-view" element={<AttendanceView />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;