import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Employee, AttendanceRecord } from '../types';
import AttendanceView from '../components/AttendanceView';
import { supabase } from '../lib/supabase';

interface UploadedEmployee {
  employee: Employee;
  records: AttendanceRecord[];
}

export default function AttendanceUploadPage() {
  const [uploadedEmployees, setUploadedEmployees] = useState<UploadedEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<{ [key: string]: AttendanceRecord[] }>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        contactNumber: emp.contact_number
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Error fetching employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
      });
      
      const processedData: { [key: string]: UploadedEmployee } = {};
      
      for (const row of jsonData) {
        const employee = employees.find(emp => 
          emp.staffId === row['ID Number'] && 
          emp.name.toLowerCase() === row['Name']?.toLowerCase()
        );

        if (employee) {
          if (!processedData[employee.id]) {
            processedData[employee.id] = {
              employee,
              records: [],
            };
          }

          const processTime = (timeValue: string) => {
            if (!timeValue) return '';
            timeValue = timeValue.trim();
            if (!isNaN(Number(timeValue))) {
              const totalMinutes = Math.round(Number(timeValue) * 60);
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
            return timeValue;
          };

          let dateValue = row['Date']?.toString() || '';
          if (dateValue) {
            try {
              if (!isNaN(Number(dateValue))) {
                const excelDate = XLSX.SSF.parse_date_code(Number(dateValue));
                dateValue = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
              } else {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                  dateValue = date.toISOString().split('T')[0];
                }
              }
            } catch (error) {
              console.error('Error parsing date:', error);
            }
          }

          const record = {
            date: dateValue,
            dutyTime: '',
            inTime1: processTime(row['IN'] || ''),
            outTime1: processTime(row['OUT'] || ''),
            inTime2: processTime(row['IN.1'] || ''),
            outTime2: processTime(row['OUT.1'] || ''),
            inTime3: processTime(row['IN.2'] || ''),
            outTime3: processTime(row['OUT.2'] || ''),
            medical: false,
            absent: false,
            remarks: '',
          };

          // Check if we already have this date for this employee
          const existingRecordIndex = processedData[employee.id].records.findIndex(
            r => r.date === record.date
          );

          if (existingRecordIndex === -1) {
            processedData[employee.id].records.push(record);
          } else {
            // Update existing record
            processedData[employee.id].records[existingRecordIndex] = record;
          }
        }
      }

      if (Object.keys(processedData).length === 0) {
        alert('No matching employees found in the uploaded file. Please check the Staff IDs and Names.');
        return;
      }

      // Sort records by date for each employee
      Object.values(processedData).forEach(({ records }) => {
        records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });

      try {
        // Update database records
        for (const employeeData of Object.values(processedData)) {
          for (const record of employeeData.records) {
            const { error } = await supabase
              .from('attendance_records')
              .upsert({
                employee_id: employeeData.employee.id,
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
              });

            if (error) throw error;
          }
        }

        setUploadedEmployees(Object.values(processedData));
        
        // Update attendance state
        const newAttendance: { [key: string]: AttendanceRecord[] } = {};
        Object.values(processedData).forEach(({ employee, records }) => {
          newAttendance[employee.id] = records;
        });
        setAttendance(newAttendance);

        // Clear the file input
        if (e.target) {
          e.target.value = '';
        }
      } catch (error) {
        console.error('Error uploading attendance records:', error);
        alert('Error uploading attendance records. Please try again.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAttendanceUpdate = async (employeeId: string, records: AttendanceRecord[]) => {
    try {
      for (const record of records) {
        const { error } = await supabase
          .from('attendance_records')
          .upsert({
            employee_id: employeeId,
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
          });

        if (error) throw error;
      }

      setAttendance({
        ...attendance,
        [employeeId]: records,
      });
    } catch (error) {
      console.error('Error updating attendance records:', error);
      alert('Error updating attendance records. Please try again.');
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
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Upload className="w-6 h-6" />
        Upload Attendance
      </h1>

      {!selectedEmployee ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">XLSX files only</p>
                  <p className="mt-2 text-xs text-gray-400">
                    Required columns: Date, ID Number, Name, IN, OUT, IN, OUT, IN, OUT
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {uploadedEmployees.length > 0 && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Uploaded Employees</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uploadedEmployees.map(({ employee, records }) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employee.staffId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{records.length} records</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedEmployee(employee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit Records
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedEmployee(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 w-fit"
          >
            Back to Upload
          </button>
          <AttendanceView
            employee={selectedEmployee}
            attendance={attendance[selectedEmployee.id] || []}
            onUpdate={(records) => handleAttendanceUpdate(selectedEmployee.id, records)}
          />
        </>
      )}
    </div>
  );
}