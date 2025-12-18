import React, { useState, useEffect } from 'react';
import { CalendarDays, Eye } from 'lucide-react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  name: string;
  staff_id: string;
}

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  color: string;
}

interface ShiftType {
  id: string;
  name: string;
  location: string;
}

interface RosterAssignment {
  employee_id: string;
  date: string;
  shift_id: string | null;
  shift_type_id: string | null;
  shift?: Shift;
  shift_type?: ShiftType;
}

const BUBBLEGUM_COLOR = '#FFB3D9';

export default function DutyRosterView() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [assignments, setAssignments] = useState<RosterAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoster, setShowRoster] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, shiftsRes, shiftTypesRes] = await Promise.all([
        supabase.from('employees').select('id, name, staff_id').order('name'),
        supabase.from('shifts').select('*').order('name'),
        supabase.from('shift_types').select('*').order('name'),
      ]);

      if (employeesRes.error) throw employeesRes.error;
      if (shiftsRes.error) throw shiftsRes.error;
      if (shiftTypesRes.error) throw shiftTypesRes.error;

      setEmployees(employeesRes.data || []);
      setShifts(shiftsRes.data || []);
      setShiftTypes(shiftTypesRes.data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRosterAssignments = async () => {
    if (selectedEmployeeIds.length === 0 || !startDate || !endDate) return;

    try {
      const { data, error } = await supabase
        .from('roster_assignments')
        .select('*')
        .in('employee_id', selectedEmployeeIds)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      setAssignments(data || []);
    } catch (err: any) {
      console.error('Error fetching roster assignments:', err);
      setError('Failed to load roster assignments');
    }
  };

  const handleViewRoster = async () => {
    if (!startDate || !endDate) {
      setError('Please select start and end dates');
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    setError('');
    await fetchRosterAssignments();
    setShowRoster(true);
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]
    );
  };

  const getAssignmentForDate = (employeeId: string, date: string): RosterAssignment | null => {
    return assignments.find((a) => a.employee_id === employeeId && a.date === date) || null;
  };

  const getShift = (shiftId: string | null): Shift | null => {
    if (!shiftId) return null;
    return shifts.find((s) => s.id === shiftId) || null;
  };

  const getShiftType = (shiftTypeId: string | null): ShiftType | null => {
    if (!shiftTypeId) return null;
    return shiftTypes.find((st) => st.id === shiftTypeId) || null;
  };

  const dates =
    startDate && endDate
      ? eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
      : [];

  const selectedEmployees = employees.filter((emp) => selectedEmployeeIds.includes(emp.id));

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
          <CalendarDays className="w-6 h-6" />
          View Duty Roster
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>
      )}

      {!showRoster ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Date Range</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-3">Select Employees</h3>
                <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                  {employees.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onChange={() => toggleEmployeeSelection(employee.id)}
                        className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                      />
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.staff_id}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedEmployeeIds.length} employee(s) selected
                </p>
              </div>

              <button
                onClick={handleViewRoster}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                View Roster
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Reference</h3>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shifts</h4>
                {shifts.length === 0 ? (
                  <p className="text-sm text-gray-500">No shifts configured</p>
                ) : (
                  <div className="space-y-2">
                    {shifts.map((shift) => (
                      <div key={shift.id} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: shift.color }}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">{shift.name}</p>
                          <p className="text-xs text-gray-500">
                            {shift.start_time} - {shift.end_time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shift Types</h4>
                {shiftTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">No shift types configured</p>
                ) : (
                  <div className="space-y-2">
                    {shiftTypes.map((shiftType) => (
                      <div key={shiftType.id} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: BUBBLEGUM_COLOR }}
                        ></div>
                        <p className="text-sm font-medium">{shiftType.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  Roster: {format(parseISO(startDate), 'MMM dd')} - {format(parseISO(endDate), 'MMM dd, yyyy')}
                </h2>
                <button
                  onClick={() => setShowRoster(false)}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Back to Selection
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200 min-w-[150px]">
                        Employee
                      </th>
                      {dates.map((date) => (
                        <th
                          key={date.toISOString()}
                          className="px-2 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 min-w-[120px]"
                        >
                          <div>{format(date, 'EEE')}</div>
                          <div className="text-xs text-gray-500">{format(date, 'MMM dd')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800 border-r border-gray-200">
                          <div>{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.staff_id}</div>
                        </td>
                        {dates.map((date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const assignment = getAssignmentForDate(employee.id, dateStr);
                          const shift = assignment ? getShift(assignment.shift_id) : null;
                          const shiftType = assignment ? getShiftType(assignment.shift_type_id) : null;

                          return (
                            <td
                              key={dateStr}
                              className="px-2 py-2 border-r border-gray-200 align-top"
                            >
                              <div className="space-y-1">
                                {shift && (
                                  <div
                                    className="px-2 py-1 text-xs rounded text-white font-medium"
                                    style={{ backgroundColor: shift.color }}
                                  >
                                    {shift.name}
                                    <div className="text-xs opacity-90">
                                      {shift.start_time} - {shift.end_time}
                                    </div>
                                  </div>
                                )}
                                {shiftType && (
                                  <div
                                    className="px-2 py-1 text-xs rounded font-medium"
                                    style={{ backgroundColor: BUBBLEGUM_COLOR }}
                                  >
                                    {shiftType.name}
                                    {shiftType.location && (
                                      <div className="text-xs opacity-75">
                                        {shiftType.location}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {!shift && !shiftType && (
                                  <div className="text-xs text-gray-400 text-center">-</div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Reference</h3>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shifts</h4>
                {shifts.length === 0 ? (
                  <p className="text-sm text-gray-500">No shifts configured</p>
                ) : (
                  <div className="space-y-2">
                    {shifts.map((shift) => (
                      <div key={shift.id} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: shift.color }}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">{shift.name}</p>
                          <p className="text-xs text-gray-500">
                            {shift.start_time} - {shift.end_time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shift Types</h4>
                {shiftTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">No shift types configured</p>
                ) : (
                  <div className="space-y-2">
                    {shiftTypes.map((shiftType) => (
                      <div key={shiftType.id} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: BUBBLEGUM_COLOR }}
                        ></div>
                        <p className="text-sm font-medium">{shiftType.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}