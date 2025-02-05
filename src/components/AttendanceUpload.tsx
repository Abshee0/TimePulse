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
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get all rows from the worksheet
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false, // Convert all values to strings
        defval: '', // Default value for empty cells
      });
      
      // Process the data to match employees
      const processedData = [];
      
      for (const row of jsonData) {
        // Find employee by matching both Staff ID and Name
        const employee = employees.find(emp => 
          emp.staffId === row['ID Number'] && 
          emp.name.toLowerCase() === row['Name']?.toLowerCase()
        );

        if (employee) {
          // Process time values
          const processTime = (timeValue: string) => {
            if (!timeValue) return '';
            timeValue = timeValue.trim();
            // If it's a number (decimal hours), convert to HH:mm
            if (!isNaN(Number(timeValue))) {
              const totalMinutes = Math.round(Number(timeValue) * 60);
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
            return timeValue;
          };

          // Process date
          let dateValue = row['Date']?.toString() || '';
          if (dateValue) {
            try {
              // If it's an Excel serial number
              if (!isNaN(Number(dateValue))) {
                const excelDate = XLSX.SSF.parse_date_code(Number(dateValue));
                dateValue = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
              } else {
                // Try to parse as date string
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                  dateValue = date.toISOString().split('T')[0];
                }
              }
            } catch (error) {
              console.error('Error parsing date:', error);
            }
          }

          processedData.push({
            employeeId: employee.id,
            date: dateValue,
            inTime1: processTime(row['IN'] || ''),
            outTime1: processTime(row['OUT'] || ''),
            inTime2: processTime(row['IN.1'] || ''),
            outTime2: processTime(row['OUT.1'] || ''),
            inTime3: processTime(row['IN.2'] || ''),
            outTime3: processTime(row['OUT.2'] || '')
          });
        }
      }

      if (processedData.length === 0) {
        alert('No matching employees found in the uploaded file. Please check the Staff IDs and Names.');
        return;
      }

      onUpload(processedData);
      
      // Clear the file input
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