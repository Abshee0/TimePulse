import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Employee, AttendanceRecord } from '../types';

interface AttendanceViewProps {
  employee: Employee;
  attendance: AttendanceRecord[];
  onUpdate: (records: AttendanceRecord[]) => void;
}

export default function AttendanceView({ employee, attendance, onUpdate }: AttendanceViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecords, setEditedRecords] = useState<AttendanceRecord[]>(attendance);

  const handleEdit = (index: number, field: keyof AttendanceRecord, value: any) => {
    const newRecords = [...editedRecords];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setEditedRecords(newRecords);
  };

  const handleSave = () => {
    onUpdate(editedRecords);
    setIsEditing(false);
  };

  const addNewDate = () => {
    const newRecord: AttendanceRecord = {
      date: format(new Date(), 'yyyy-MM-dd'),
      dutyTime: '',
      inTime1: '',
      outTime1: '',
      inTime2: '',
      outTime2: '',
      inTime3: '',
      outTime3: '',
      medical: false,
      absent: false,
      remarks: '',
    };
    setEditedRecords([...editedRecords, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    // If time is in decimal format (e.g., 9.5), convert it to HH:mm
    if (!isNaN(Number(time))) {
      const hours = Math.floor(Number(time));
      const minutes = Math.round((Number(time) - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return time;
  };

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd/MM/yyyy');
    } catch {
      return date;
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{employee.name}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Staff ID:</strong> {employee.staffId}</p>
              <p><strong>Position:</strong> {employee.position}</p>
            </div>
            <div>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Contact:</strong> {employee.contactNumber}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Attendance Records</h3>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditedRecords(attendance);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Date
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Records
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Duty Time</th>
                <th className="px-4 py-2">IN</th>
                <th className="px-4 py-2">OUT</th>
                <th className="px-4 py-2">IN</th>
                <th className="px-4 py-2">OUT</th>
                <th className="px-4 py-2">IN</th>
                <th className="px-4 py-2">OUT</th>
                <th className="px-4 py-2">Medical</th>
                <th className="px-4 py-2">Absent</th>
                <th className="px-4 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {editedRecords.map((record, index) => (
                <tr key={`${record.date}-${index}`} className="border-b">
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="date"
                        value={record.date}
                        onChange={(e) => handleEdit(index, 'date', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      formatDate(record.date)
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={record.dutyTime}
                        onChange={(e) => handleEdit(index, 'dutyTime', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      record.dutyTime
                    )}
                  </td>
                  <td className="px-4 py-2">{formatTime(record.inTime1)}</td>
                  <td className="px-4 py-2">{formatTime(record.outTime1)}</td>
                  <td className="px-4 py-2">{formatTime(record.inTime2)}</td>
                  <td className="px-4 py-2">{formatTime(record.outTime2)}</td>
                  <td className="px-4 py-2">{formatTime(record.inTime3)}</td>
                  <td className="px-4 py-2">{formatTime(record.outTime3)}</td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={record.medical}
                        onChange={(e) => handleEdit(index, 'medical', e.target.checked)}
                        className="w-4 h-4"
                      />
                    ) : (
                      record.medical ? '✓' : ''
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={record.absent}
                        onChange={(e) => handleEdit(index, 'absent', e.target.checked)}
                        className="w-4 h-4"
                      />
                    ) : (
                      record.absent ? '✓' : ''
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={record.remarks}
                        onChange={(e) => handleEdit(index, 'remarks', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      record.remarks
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}