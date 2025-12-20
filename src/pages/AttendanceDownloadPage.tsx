import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Employee, AttendanceRecord } from '../types';
import { supabase } from '../lib/supabase';

export default function AttendanceDownloadPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [employeesWithAttendance, setEmployeesWithAttendance] = useState<{ employee: Employee; attendance: AttendanceRecord[] }[]>([]);

  useEffect(() => {
    fetchEmployeesWithAttendance();
  }, []);

  const fetchEmployeesWithAttendance = async () => {
    try {
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;

      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*');

      if (attendanceError) throw attendanceError;

      const { data: rosterData, error: rosterError } = await supabase
        .from('roster_assignments')
        .select(`
          employee_id,
          date,
          shifts(start_time, grace_period)
        `);

      if (rosterError) throw rosterError;

      const rosterMap = new Map(
        rosterData?.map((r: any) => [
          `${r.employee_id}-${r.date}`,
          { startTime: r.shifts?.start_time, gracePeriod: r.shifts?.grace_period || 0 }
        ]) || []
      );

      const employeeMap = employees.map(emp => ({
        employee: {
          id: emp.id,
          name: emp.name,
          staffId: emp.staff_id,
          position: emp.position,
          department: emp.department,
          contactNumber: emp.contact_number
        },
        attendance: attendanceRecords
          .filter(record => record.employee_id === emp.id)
          .map(record => {
            const rosterInfo = rosterMap.get(`${emp.id}-${record.date}`);
            return {
              date: record.date,
              dutyTime: rosterInfo?.startTime || '',
              inTime1: record.in_time1 || '',
              outTime1: record.out_time1 || '',
              inTime2: record.in_time2 || '',
              outTime2: record.out_time2 || '',
              inTime3: record.in_time3 || '',
              outTime3: record.out_time3 || '',
              medical: record.medical,
              absent: record.absent,
              remarks: record.remarks || '',
              gracePeriod: rosterInfo?.gracePeriod
            };
          })
      }));

      setEmployeesWithAttendance(employeeMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAttendance = () => {
    const workbook = XLSX.utils.book_new();

    employeesWithAttendance.forEach(({ employee, attendance }) => {
      const filteredAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return (!startDate || recordDate >= new Date(startDate)) &&
               (!endDate || recordDate <= new Date(endDate));
      });

      if (filteredAttendance.length === 0) return;

      // Sort attendance by date
      filteredAttendance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Employee Info
      const employeeInfo = [
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
        new Date(record.date).toLocaleDateString(),
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

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, employee.name.slice(0, 31)); // Excel sheet names limited to 31 chars
    });

    // Generate filename with date range
    const filename = `attendance_report_${startDate || 'start'}_${endDate || 'end'}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Download className="w-6 h-6" />
        Download Attendance Report
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
        </div>

        <button
          onClick={downloadAttendance}
          disabled={!startDate || !endDate || employeesWithAttendance.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>
    </div>
  );
}