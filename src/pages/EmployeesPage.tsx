import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Users } from 'lucide-react';
import { Employee } from '../types';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { supabase } from '../lib/supabase';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
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

  const handleAddEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([{
          name: employee.name,
          staff_id: employee.staffId,
          position: employee.position,
          department: employee.department,
          contact_number: employee.contactNumber
        }])
        .select()
        .single();

      if (error) throw error;

      setEmployees([...employees, {
        id: data.id,
        name: data.name,
        staffId: data.staff_id,
        position: data.position,
        department: data.department,
        contactNumber: data.contact_number
      }]);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee. Please try again.');
    }
  };

  const handleEditEmployee = async (updatedEmployee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: updatedEmployee.name,
          staff_id: updatedEmployee.staffId,
          position: updatedEmployee.position,
          department: updatedEmployee.department,
          contact_number: updatedEmployee.contactNumber
        })
        .eq('id', updatedEmployee.id);

      if (error) throw error;

      setEmployees(employees.map(emp =>
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      ));
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error updating employee. Please try again.');
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Employees
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.staffId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingEmployee(employee);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={(employee) => {
          if (editingEmployee) {
            handleEditEmployee({ ...employee, id: editingEmployee.id });
          } else {
            handleAddEmployee(employee);
          }
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />
    </div>
  );
}