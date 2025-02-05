import React, { useState, useEffect } from 'react';
import { BarChart } from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { supabase } from '../lib/supabase';
import AttendanceView from '../components/AttendanceView'; // Assuming AttendanceView is in the same directory

export default function AttendanceViewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

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

      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Error fetching attendance. Please try again.');
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    fetchAttendance(employee.id); // Fetch attendance when an employee is selected
  };

  const handleAttendanceUpdate = (updatedRecords: AttendanceRecord[]) => {
    setAttendanceRecords(updatedRecords); // Update the state with the new records

    // Optionally, you can save the updated attendance data to Supabase here
    updatedRecords.forEach(async (record) => {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          employee_id: selectedEmployee?.id,
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
          remarks: record.remarks,
        });

      if (error) {
        console.error('Error updating attendance record:', error);
      }
    });
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

      {/* Display AttendanceView below the table when an employee is selected */}
      {selectedEmployee && attendanceRecords.length > 0 && (
        <AttendanceView
          employee={selectedEmployee}
          attendance={attendanceRecords}
          onUpdate={handleAttendanceUpdate}
        />
      )}
    </div>
  );
}
