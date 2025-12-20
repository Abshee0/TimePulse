import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Employee, AttendanceRecord } from '../types';

interface AttendanceViewProps {
  employee: Employee;
  attendance: AttendanceRecord[];
  onUpdate: (records: AttendanceRecord[]) => void;
}

const ROWS_PER_PAGE = 30;

export default function AttendanceView({
  employee,
  attendance,
  onUpdate,
}: AttendanceViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecords, setEditedRecords] = useState<AttendanceRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('asc');

  /* ---------- Initialize & sort ---------- */
  useEffect(() => {
    setEditedRecords(
      [...attendance].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
    setCurrentPage(1);
  }, [attendance]);

  /* ---------- Sorting ---------- */
  const sortedRecords = useMemo(() => {
    return [...editedRecords].sort((a, b) => {
      const diff =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      return dateSort === 'asc' ? diff : -diff;
    });
  }, [editedRecords, dateSort]);

  /* ---------- Pagination ---------- */
  const totalPages = Math.ceil(sortedRecords.length / ROWS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedRecords.slice(start, start + ROWS_PER_PAGE);
  }, [sortedRecords, currentPage]);

  /* ---------- Edit helpers ---------- */
  const handleEdit = (
    index: number,
    field: keyof AttendanceRecord,
    value: any
  ) => {
    const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index;
    const updated = [...editedRecords];
    updated[globalIndex] = { ...updated[globalIndex], [field]: value };
    setEditedRecords(updated);
  };

  const handleSave = async () => {
    if (isSaving) return;

    const sorted = [...editedRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const seen = new Set<string>();
    for (const r of sorted) {
      if (seen.has(r.date)) {
        alert(`Duplicate date found: ${r.date}`);
        return;
      }
      seen.add(r.date);
    }

    try {
      setIsSaving(true);
      await onUpdate(sorted);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const addNewDate = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (editedRecords.some(r => r.date === today)) {
      alert('Record for today already exists.');
      return;
    }

    setEditedRecords(prev =>
      [...prev, {
        date: today,
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
        gracePeriod: 0,
      }]
    );
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    if (!isNaN(Number(time))) {
      const h = Math.floor(Number(time));
      const m = Math.round((Number(time) - h) * 60);
      return `${h.toString().padStart(2, '0')}:${m
        .toString()
        .padStart(2, '0')}`;
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

  const isLate = (record: AttendanceRecord): boolean => {
    if (!record.inTime1 || !record.dutyTime || record.gracePeriod === undefined) {
      return false;
    }

    try {
      const [shiftHour, shiftMin] = record.dutyTime.split(':').map(Number);
      const [inHour, inMin] = record.inTime1.split(':').map(Number);

      const shiftMinutes = shiftHour * 60 + shiftMin;
      const inMinutes = inHour * 60 + inMin;
      const gracePeriodMinutes = record.gracePeriod || 0;

      return inMinutes > shiftMinutes + gracePeriodMinutes;
    } catch {
      return false;
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-sm text-gray-600">
            {employee.staffId} · {employee.position} · {employee.department} · {employee.contactNumber}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Attendance Records</h3>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditedRecords([...attendance]);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button onClick={addNewDate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-2 cursor-pointer select-none"
                  onClick={() =>
                    setDateSort(dateSort === 'asc' ? 'desc' : 'asc')
                  }
                >
                  Date {dateSort === 'asc' ? '▲' : '▼'}
                </th>
                {[
                  'Duty',
                  'IN',
                  'OUT',
                  'IN',
                  'OUT',
                  'IN',
                  'OUT',
                  'Medical',
                  'Absent',
                  'Remarks',
                ].map(h => (
                  <th key={h} className="px-4 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record, index) => (
                <tr
                  key={`${record.date}-${index}`}
                  className={`border-b ${isLate(record) ? 'bg-pink-100' : ''}`}
                >
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="date"
                        value={record.date}
                        onChange={e =>
                          handleEdit(index, 'date', e.target.value)
                        }
                        className="border rounded px-2 py-1 text-center"
                      />
                    ) : (
                      formatDate(record.date)
                    )}
                  </td>

                  <td className="px-4 py-2">
                    {record.dutyTime}
                  </td>

                  <td className="px-4 py-2">{formatTime(record.inTime1)}</td>
                  <td className="px-4 py-2">{formatTime(record.outTime1)}</td>
                  <td className="px-4 py-2">{formatTime(record.inTime2)}</td>
                  <td className="px-4 py-2">{formatTime(record.outTime2)}</td>
                  <td className="px-4 py-2">{formatTime(record.inTime3)}</td>
                  <td className="px-4 py-2">{formatTime(record.outTime3)}</td>
                  <td className="px-4 py-2">{record.medical ? '✓' : ''}</td>
                  <td className="px-4 py-2">{record.absent ? '✓' : ''}</td>
                  <td className="px-4 py-2">{record.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
