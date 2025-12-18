import React, { useEffect, useState } from 'react';
import { CalendarDays, Users, Thermometer, PlaneTakeoff, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns';

interface Employee {
  id: string;
  name: string;
  staff_id: string;
}

interface LeavePlan {
  id: string;
  employee_id: string;
  leave_type: 'Annual' | 'FRL' | 'Sick';
  start_date: string;
  end_date: string;
  employee_name: string;
}

interface RosterAssignment {
  employee_id: string;
  employee_name: string;
  shift_name: string;
  shift_type_name: string;
  start_time: string;
  end_time: string;
  location: string;
}

interface ModalState {
  isOpen: boolean;
  date: Date | null;
  leaves: LeavePlan[];
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leavePlans, setLeavePlans] = useState<LeavePlan[]>([]);
  const [todayRoster, setTodayRoster] = useState<RosterAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all');

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    date: null,
    leaves: [],
  });

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEmployees(),
        fetchLeavePlans(),
        fetchTodayRoster(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select('id, name, staff_id')
      .order('name');
    setEmployees(data || []);
  };

  const fetchLeavePlans = async () => {
    const { data } = await supabase
      .from('leave_plans')
      .select(`
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        employees(name)
      `)
      .order('start_date');

    setLeavePlans(
      data?.map((plan: any) => ({
        id: plan.id,
        employee_id: plan.employee_id,
        leave_type: plan.leave_type,
        start_date: plan.start_date,
        end_date: plan.end_date,
        employee_name: plan.employees?.name || 'Unknown',
      })) || []
    );
  };

  const fetchTodayRoster = async () => {
    const { data } = await supabase
      .from('roster_assignments')
      .select(`
        employee_id,
        employees(name, staff_id),
        shifts(name, start_time, end_time),
        shift_types(name, location)
      `)
      .eq('date', todayStr);

    setTodayRoster(
      data?.map((assignment: any) => ({
        employee_id: assignment.employee_id,
        employee_name: assignment.employees?.name || 'Unknown',
        shift_name: assignment.shifts?.name || '',
        shift_type_name: assignment.shift_types?.name || '',
        start_time: assignment.shifts?.start_time || '',
        end_time: assignment.shifts?.end_time || '',
        location: assignment.shift_types?.location || '',
      })) || []
    );
  };

  const isDateInRange = (date: Date, startDate: string, endDate: string): boolean => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate >= start && checkDate <= end;
  };

  const getLeavesForDate = (date: Date): LeavePlan[] => {
    return leavePlans.filter(plan =>
      isDateInRange(date, plan.start_date, plan.end_date)
    );
  };

  const getLeavesForToday = () => {
    return leavePlans.filter(plan =>
      isDateInRange(today, plan.start_date, plan.end_date)
    );
  };

  const totalStaff = employees.length;
  const leavesToday = getLeavesForToday();
  const onLeaveToday = leavesToday.length;
  const onSickLeaveToday = leavesToday.filter(l => l.leave_type === 'Sick').length;
  const onFRLToday = leavesToday.filter(l => l.leave_type === 'FRL').length;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const totalLeavesThisMonth = leavePlans.filter(plan => {
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);
    return (start >= monthStart && start <= monthEnd) ||
           (end >= monthStart && end <= monthEnd) ||
           (start <= monthStart && end >= monthEnd);
  }).length;

  const totalSickLeavesThisMonth = leavePlans.filter(plan => {
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);
    return plan.leave_type === 'Sick' && (
      (start >= monthStart && start <= monthEnd) ||
      (end >= monthStart && end <= monthEnd) ||
      (start <= monthStart && end >= monthEnd)
    );
  }).length;

  const getLeaveColor = (leaveType: string): string => {
    switch (leaveType) {
      case 'Annual':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'FRL':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Sick':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleDateClick = (date: Date) => {
    const leaves = getLeavesForDate(date);
    if (leaves.length > 0) {
      setModal({
        isOpen: true,
        date,
        leaves,
      });
    }
  };

  const filteredCalendarLeaves = selectedLeaveType === 'all'
    ? leavePlans
    : leavePlans.filter(l => l.leave_type === selectedLeaveType);

  const getFilteredLeavesForDate = (date: Date): LeavePlan[] => {
    return filteredCalendarLeaves.filter(plan =>
      isDateInRange(date, plan.start_date, plan.end_date)
    );
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const calendarDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array(daysInMonth).keys().map(i => i + 1)
  ];

  if (loading) {
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
          Attendance Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-3xl font-bold text-gray-800">{totalStaff}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave Today</p>
              <p className="text-3xl font-bold text-gray-800">{onLeaveToday}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Sick Leave</p>
              <p className="text-3xl font-bold text-gray-800">{onSickLeaveToday}</p>
            </div>
            <Thermometer className="w-10 h-10 text-pink-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On FRL</p>
              <p className="text-3xl font-bold text-gray-800">{onFRLToday}</p>
            </div>
            <PlaneTakeoff className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Leave Calendar</h2>
            <div className="flex items-center gap-4">
              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">All Leave Types</option>
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="FRL">FRL</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square"></div>;
              }

              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const leaves = getFilteredLeavesForDate(date);
              const hasLeaves = leaves.length > 0;
              const isToday = isSameDay(date, today);

              return (
                <div
                  key={day}
                  onClick={() => hasLeaves && handleDateClick(date)}
                  className={`aspect-square rounded-lg p-2 text-sm flex flex-col border-2 transition-all ${
                    isToday
                      ? 'border-blue-600 bg-blue-50'
                      : hasLeaves
                      ? 'border-blue-300 bg-blue-50 cursor-pointer hover:shadow-md'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day}
                  </div>
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {leaves.slice(0, 3).map(leave => (
                      <div
                        key={leave.id}
                        className={`px-1 py-0.5 rounded text-xs font-semibold truncate border ${getLeaveColor(
                          leave.leave_type
                        )}`}
                      >
                        {leave.employee_name.split(' ')[0]}
                      </div>
                    ))}
                    {leaves.length > 3 && (
                      <div className="px-1 py-0.5 text-xs text-gray-500">
                        +{leaves.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-sm text-gray-700">Annual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-sm text-gray-700">FRL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-pink-500"></div>
              <span className="text-sm text-gray-700">Sick</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Duty Roster - Today</h2>
            {todayRoster.length === 0 ? (
              <p className="text-gray-500 text-sm">No roster assignments for today</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayRoster.map((assignment, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-3 py-2 bg-gray-50 rounded">
                    <p className="font-semibold text-gray-800">{assignment.employee_name}</p>
                    {assignment.shift_name && (
                      <p className="text-sm text-gray-600">
                        {assignment.shift_name}
                        {assignment.start_time && assignment.end_time && (
                          <span> ({assignment.start_time} - {assignment.end_time})</span>
                        )}
                      </p>
                    )}
                    {assignment.shift_type_name && (
                      <p className="text-sm text-gray-600">{assignment.shift_type_name}</p>
                    )}
                    {assignment.location && (
                      <p className="text-xs text-gray-500">{assignment.location}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">This Month</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Leaves</span>
                <span className="text-2xl font-bold text-gray-800">{totalLeavesThisMonth}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Sick Leaves</span>
                <span className="text-2xl font-bold text-pink-600">{totalSickLeavesThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-pink-600" />
            Sick Leave Today
          </h2>
          {leavesToday.filter(l => l.leave_type === 'Sick').length === 0 ? (
            <p className="text-gray-500 text-sm">No sick leave today</p>
          ) : (
            <div className="space-y-3">
              {leavesToday
                .filter(l => l.leave_type === 'Sick')
                .map(leave => {
                  const duration = Math.ceil(
                    (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)
                  ) + 1;
                  return (
                    <div key={leave.id} className="border-l-4 border-pink-600 pl-4 py-3 bg-pink-50 rounded">
                      <p className="font-semibold text-gray-800">{leave.employee_name}</p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(leave.start_date), 'MMM dd')} - {format(parseISO(leave.end_date), 'MMM dd')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {duration} {duration === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PlaneTakeoff className="w-5 h-5 text-orange-600" />
            FRL Today
          </h2>
          {leavesToday.filter(l => l.leave_type === 'FRL').length === 0 ? (
            <p className="text-gray-500 text-sm">No FRL today</p>
          ) : (
            <div className="space-y-3">
              {leavesToday
                .filter(l => l.leave_type === 'FRL')
                .map(leave => {
                  const duration = Math.ceil(
                    (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)
                  ) + 1;
                  return (
                    <div key={leave.id} className="border-l-4 border-orange-600 pl-4 py-3 bg-orange-50 rounded">
                      <p className="font-semibold text-gray-800">{leave.employee_name}</p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(leave.start_date), 'MMM dd')} - {format(parseISO(leave.end_date), 'MMM dd')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {duration} {duration === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {modal.date && format(modal.date, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {modal.leaves.map(leave => (
                <div key={leave.id} className="px-6 py-4">
                  <p className="font-semibold text-gray-800">{leave.employee_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(parseISO(leave.start_date), 'MMM dd')} - {format(parseISO(leave.end_date), 'MMM dd')}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getLeaveColor(
                      leave.leave_type
                    )}`}
                  >
                    {leave.leave_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
