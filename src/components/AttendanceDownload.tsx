import React, { useState } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Employee, AttendanceRecord } from '../types';

interface AttendanceDownloadProps {
  employee: Employee;
  attendance: AttendanceRecord[];
}

export default function AttendanceDownload({ employee, attendance }: AttendanceDownloadProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const downloadAttendance = () => {
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return (!startDate || recordDate >= new Date(startDate)) &&
             (!endDate || recordDate <= new Date(endDate));
    });

    // Sort attendance by date
    filteredAttendance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const workbook = XLSX.utils.book_new();
    
    // Title and Employee Info
    const employeeInfo = [
      ['Attendance Report'],
      [''],
      ['Employee Information'],
      ['Name:', employee.name],
      ['Staff ID:', employee.staffId],
      ['Position:', employee.position],
      ['Department:', employee.department],
      ['Contact No.:', employee.contactNumber],
      [''],
      ['Period:', startDate ? new Date(startDate).toLocaleDateString() : 'Start', 'to', endDate ? new Date(endDate).toLocaleDateString() : 'End'],
      ['']
    ];

    // Headers
    const headers = [
      'Date',
      'Duty Time',
      'First In',
      'First Out',
      'Second In',
      'Second Out',
      'Third In',
      'Third Out',
      'Medical',
      'Absent',
      'Remarks'
    ];

    // Format the data
    const data = filteredAttendance.map(record => [
      new Date(record.date).toLocaleDateString(), // Format date
      record.dutyTime,
      record.inTime1,
      record.outTime1,
      record.inTime2,
      record.outTime2,
      record.inTime3,
      record.outTime3,
      record.medical ? 'Yes' : 'No',
      record.absent ? 'Yes' : 'No',
      record.remarks
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([...employeeInfo, headers, ...data]);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Duty Time
      { wch: 10 }, // First In
      { wch: 10 }, // First Out
      { wch: 10 }, // Second In
      { wch: 10 }, // Second Out
      { wch: 10 }, // Third In
      { wch: 10 }, // Third Out
      { wch: 8 },  // Medical
      { wch: 8 },  // Absent
      { wch: 20 }  // Remarks
    ];
    worksheet['!cols'] = columnWidths;

    // Style the title and headers
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, // Merge title cells
      { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } }  // Merge Employee Information cells
    ];

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Generate filename with employee name and date range
    const filename = `attendance_${employee.name.replace(/\s+/g, '_')}_${startDate || 'start'}_${endDate || 'end'}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Download Attendance Report</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>
      <button
        onClick={downloadAttendance}
        disabled={!startDate || !endDate}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        <Download className="w-4 h-4" />
        Download Report
      </button>
    </div>
  );
}