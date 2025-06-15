import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Employee } from '../types';

interface AttendanceUploadProps {
  onUpload: (data: any[]) => void;
  employees: Employee[];
}

export default function AttendanceUpload({ onUpload, employees }: AttendanceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
      });

      const processedData = [];

      for (const row of jsonData) {
        const employee = employees.find(emp =>
          emp.staffId === row['ID Number'] &&
          emp.name.toLowerCase() === row['Name']?.toLowerCase()
        );

        if (employee) {
          // Convert time to HH:mm
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

          // Process and adjust date
          let dateValue = row['Date']?.toString().trim() || '';
          try {
            if (!isNaN(Number(dateValue))) {
              // Excel numeric date
              const excelDate = XLSX.SSF.parse_date_code(Number(dateValue));
              const jsDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
              jsDate.setDate(jsDate.getDate() + 1); // Add 1 day
              dateValue = jsDate.toISOString().split('T')[0];
            } else if (typeof dateValue === 'string' && dateValue.includes('/')) {
              // Date in string format: DD/MM/YYYY
              const [day, month, year] = dateValue.split('/');
              const jsDate = new Date(Number(year), Number(month) - 1, Number(day));
              jsDate.setDate(jsDate.getDate() + 1); // Add 1 day
              dateValue = jsDate.toISOString().split('T')[0];
            }
          } catch (error) {
            console.error('Error parsing date:', row['Date'], error);
          }

          processedData.push({
            employeeId: employee.id,
            date: dateValue,
            inTime1: processTime(row['IN']),
            outTime1: processTime(row['OUT']),
            inTime2: processTime(row['IN.1']),
            outTime2: processTime(row['OUT.1']),
            inTime3: processTime(row['IN.2']),
            outTime3: processTime(row['OUT.2']),
          });
        }
      }

      if (processedData.length === 0) {
        alert('No matching employees found in the uploaded file. Please check the Staff IDs and Names.');
        return;
      }

      console.table(processedData); // Debug output to verify dates
      onUpload(processedData);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6">
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
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </div>
  );
}