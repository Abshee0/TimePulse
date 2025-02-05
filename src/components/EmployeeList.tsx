import React, { useState } from 'react';
import { Plus, Pencil, Users } from 'lucide-react';
import { Employee } from '../types';
import AddEmployeeModal from './AddEmployeeModal';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onSelectEmployee: (employee: Employee) => void;
}

export default function EmployeeList({ employees, onAddEmployee, onEditEmployee, onSelectEmployee }: EmployeeListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
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
                <tr 
                  key={employee.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectEmployee(employee)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.staffId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
            onEditEmployee({ ...employee, id: editingEmployee.id });
          } else {
            onAddEmployee({ ...employee, id: crypto.randomUUID() });
          }
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />
    </div>
  );
}