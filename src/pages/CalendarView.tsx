import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeavePlan {
  id: string;
  employee_id: string;
  leave_type: 'Annual' | 'FRL' | 'Sick';
  start_date: string;
  end_date: string;
  employee_name: string;
}

interface ModalState {
  isOpen: boolean;
  date: Date | null;
  leaves: LeavePlan[];
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leavePlans, setLeavePlans] = useState<LeavePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    date: null,
    leaves: [],
  });

  useEffect(() => {
    fetchLeavePlans();
  }, []);

  const fetchLeavePlans = async () => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

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
    } catch (err: any) {
      console.error('Error fetching leave plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getLeaveColor = (leaveType: string): string => {
    switch (leaveType) {
      case 'Annual':
        return 'bg-green-100 text-green-800';
      case 'FRL':
        return 'bg-orange-100 text-orange-800';
      case 'Sick':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const leaves = getLeavesForDate(date);
    if (leaves.length > 0) {
      setModal({
        isOpen: true,
        date,
        leaves,
      });
    }
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array(daysInMonth).keys().map(i => i + 1)];

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
          <Calendar className="w-6 h-6" />
          Leave Calendar View
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm text-gray-700">Annual Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-sm text-gray-700">FRL Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-pink-500"></div>
                <span className="text-sm text-gray-700">Sick Leave</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square"></div>;
                }

                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const leaves = getLeavesForDate(date);
                const hasLeaves = leaves.length > 0;

                return (
                  <div
                    key={day}
                    onClick={() => hasLeaves && handleDateClick(day)}
                    className={`aspect-square rounded-lg p-2 text-sm flex flex-col border-2 transition-all ${
                      hasLeaves
                        ? 'border-blue-300 bg-blue-50 cursor-pointer hover:shadow-md'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-gray-800 mb-1">{day}</div>
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {leaves.slice(0, 5).map(leave => (
                        <div
                          key={leave.id}
                          className={`px-1 py-0.5 rounded text-xs font-semibold truncate ${getLeaveColor(
                            leave.leave_type
                          )}`}
                        >
                          {leave.employee_name}
                        </div>
                      ))}
                      {leaves.length > 5 && (
                        <div className="px-1 py-0.5 text-xs text-gray-500">
                          +{leaves.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {modal.date?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
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
                    {new Date(leave.start_date).toLocaleDateString()} -{' '}
                    {new Date(leave.end_date).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${getLeaveColor(
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
