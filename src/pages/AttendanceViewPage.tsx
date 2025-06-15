import React, { useState, useEffect } from 'react';
import { BarChart } from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { supabase } from '../lib/supabase';
import AttendanceView from '../components/AttendanceView';

export default function AttendanceViewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;

      setEmployees(data.map(emp => ({
        id: emp.id,
        name: emp.name,
        staffId: emp.staff_id,
        position: emp.position,
        department: emp.department,
        contactNumber: emp.contact_number,
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Error fetching employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: true });

      if (error) throw error;

      // Map database records to frontend format
      const mappedRecords: AttendanceRecord[] = (data || []).map(record => ({
        date: record.date,
        dutyTime: record.duty_time || '',
        inTime1: record.in_time1 || '',
        outTime1: record.out_time1 || '',
        inTime2: record.in_time2 || '',
        outTime2: record.out_time2 || '',
        inTime3: record.in_time3 || '',
        outTime3: record.out_time3 || '',
        medical: record.medical || false,
        absent: record.absent || false,
        remarks: record.remarks || ''
      }));

      setAttendanceRecords(mappedRecords);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Error fetching attendance. Please try again.');
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    fetchAttendance(employee.id);
  };

  const handleAttendanceUpdate = async (updatedRecords: AttendanceRecord[]) => {
    if (!selectedEmployee || isUpdating) return;

    try {
      setIsUpdating(true);

      // Sort records by date
      const sortedRecords = [...updatedRecords].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Get existing records for this employee
      const { data: existingRecords, error: fetchError } = await supabase
        .from('attendance_records')
        .select('date')
        .eq('employee_id', selectedEmployee.id);

      if (fetchError) throw fetchError;

      const existingDates = new Set(existingRecords?.map(record => record.date));

      // Process records in sequence to avoid race conditions
      for (const record of sortedRecords) {
        const recordData = {
          employee_id: selectedEmployee.id,
          date: record.date,
          duty_time: record.dutyTime,
          in_time1: record.inTime1,
          out_time1: record.outTime1,
          in_time2: record.inTime2,
          out_time2: record.outTime2,
          in_time3: record.inTime3,
          out_time3: record.outTime3,
          medical: record.medical,
          absent: record.absent,
          remarks: record.remarks
        };

        const { error } = await supabase
          .from('attendance_records')
          .upsert(recordData, {
            onConflict: 'employee_id,date'
          });

        if (error) throw error;
      }

      // Update the local state with the sorted records
      setAttendanceRecords(sortedRecords);
    } catch (error) {
      console.error('Error updating attendance records:', error);
      alert('Error updating attendance records. Please try again.');
      throw error; // Re-throw to trigger error handling in AttendanceView
    } finally {
      setIsUpdating(false);
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart className="w-6 h-6" />
          Attendance Viewer
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <td className="px-6 py-4">{employee.name}</td>
                  <td className="px-6 py-4">{employee.staffId}</td>
                  <td className="px-6 py-4">{employee.position}</td>
                  <td className="px-6 py-4">{employee.department}</td>
                  <td className="px-6 py-4">{employee.contactNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <AttendanceView
          employee={selectedEmployee}
          attendance={attendanceRecords}
          onUpdate={handleAttendanceUpdate}
        />
      )}
    </div>
  );
}