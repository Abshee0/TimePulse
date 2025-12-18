import React, { useState, useEffect } from 'react';
import { PlaneTakeoff, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LeavePlan {
  id: string;
  employee_id: string;
  leave_type: 'Annual' | 'FRL' | 'Sick';
  start_date: string;
  end_date: string;
  employee_name?: string;
}

interface Employee {
  id: string;
  name: string;
}

const LEAVE_LIMITS = {
  'Annual': 30,
  'FRL': 10,
  'Sick': 30,
};

export default function LeaveManager() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leavePlans, setLeavePlans] = useState<LeavePlan[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    leave_type: 'Annual' as const,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchLeavePlans();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

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
          employee_name: plan.employees?.name,
        })) || []
      );
    } catch (err: any) {
      console.error('Error fetching leave plans:', err);
    }
  };

  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const validateAndAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEmployee || !formData.start_date || !formData.end_date) {
      setError('Please fill in all fields');
      return;
    }

    const employeePlans = leavePlans.filter(p => p.employee_id === selectedEmployee);

    if (employeePlans.length >= 3) {
      setError('Maximum 3 leave plans per employee allowed');
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01`);
    const yearEnd = new Date(`${currentYear}-12-31`);

    const daysRequested = calculateLeaveDays(formData.start_date, formData.end_date);
    const limit = LEAVE_LIMITS[formData.leave_type];

    const existingDaysForType = employeePlans
      .filter(p => p.leave_type === formData.leave_type)
      .reduce((total, plan) => {
        const planStart = new Date(plan.start_date);
        const planEnd = new Date(plan.end_date);

        if (planStart.getFullYear() === currentYear) {
          return total + calculateLeaveDays(plan.start_date, plan.end_date);
        }
        return total;
      }, 0);

    if (existingDaysForType + daysRequested > limit) {
      setError(
        `Exceeds ${formData.leave_type} Leave limit. Used: ${existingDaysForType} days, Limit: ${limit} days`
      );
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('leave_plans')
        .insert([
          {
            employee_id: selectedEmployee,
            leave_type: formData.leave_type,
            start_date: formData.start_date,
            end_date: formData.end_date,
            created_by: user?.id,
          },
        ]);

      if (insertError) throw insertError;

      setFormData({
        leave_type: 'Annual',
        start_date: '',
        end_date: '',
      });

      await fetchLeavePlans();
    } catch (err: any) {
      setError('Failed to add leave plan');
      console.error(err);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('leave_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      await fetchLeavePlans();
    } catch (err: any) {
      setError('Failed to delete leave plan');
      console.error(err);
    }
  };

  const selectedEmployeeName = employees.find(e => e.id === selectedEmployee)?.name;
  const selectedEmployeePlans = leavePlans.filter(p => p.employee_id === selectedEmployee);

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
          <PlaneTakeoff className="w-6 h-6" />
          Leave Manager
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Select Employee</h2>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">Choose an employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add Leave Plan</h2>

            {selectedEmployee && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">Annual: 0/30 days</p>
                <p className="font-semibold mb-1">FRL: 0/10 days</p>
                <p className="font-semibold">Sick: 0/30 days</p>
              </div>
            )}

            <form onSubmit={validateAndAddPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <select
                  value={formData.leave_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leave_type: e.target.value as 'Annual' | 'FRL' | 'Sick',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="FRL">FRL Leave</option>
                  <option value="Sick">Sick Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedEmployee}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Leave Plan
              </button>
            </form>
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Leave Plans for {selectedEmployeeName} ({selectedEmployeePlans.length}/3)
            </h2>
          </div>

          {selectedEmployeePlans.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No leave plans assigned yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedEmployeePlans.map(plan => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          plan.leave_type === 'Annual'
                            ? 'bg-green-100 text-green-800'
                            : plan.leave_type === 'FRL'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-pink-100 text-pink-800'
                        }`}>
                          {plan.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(plan.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(plan.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {calculateLeaveDays(plan.start_date, plan.end_date)} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
