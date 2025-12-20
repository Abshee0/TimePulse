import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Shift } from '../types';

interface ShiftType {
  id: string;
  name: string;
  description: string;
  location: string;
}

const FIXED_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
];

const BUBBLEGUM_COLOR = '#FFB3D9';

export default function RosterManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'shifts' | 'shift_types'>('shifts');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [shiftForm, setShiftForm] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    color: FIXED_COLORS[0].value,
    grace_period: 0,
  });

  const [shiftTypeForm, setShiftTypeForm] = useState({
    name: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    fetchShifts();
    fetchShiftTypes();
  }, []);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('name');

      if (error) throw error;
      setShifts(data || []);
    } catch (err: any) {
      console.error('Error fetching shifts:', err);
      setError('Failed to load shifts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShiftTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setShiftTypes(data || []);
    } catch (err: any) {
      console.error('Error fetching shift types:', err);
      setError('Failed to load shift types');
    }
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shiftForm.name || !shiftForm.start_time || !shiftForm.end_time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert([
          {
            name: shiftForm.name,
            description: shiftForm.description,
            start_time: shiftForm.start_time,
            end_time: shiftForm.end_time,
            color: shiftForm.color,
            grace_period: shiftForm.grace_period,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShifts([...shifts, data]);
      setShiftForm({
        name: '',
        description: '',
        start_time: '',
        end_time: '',
        color: FIXED_COLORS[0].value,
        grace_period: 0,
      });
    } catch (err: any) {
      console.error('Error adding shift:', err);
      setError('Failed to add shift');
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      const { error } = await supabase.from('shifts').delete().eq('id', shiftId);

      if (error) throw error;
      setShifts(shifts.filter((s) => s.id !== shiftId));
    } catch (err: any) {
      console.error('Error deleting shift:', err);
      setError('Failed to delete shift');
    }
  };

  const handleAddShiftType = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shiftTypeForm.name) {
      setError('Please fill in the name field');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shift_types')
        .insert([
          {
            name: shiftTypeForm.name,
            description: shiftTypeForm.description,
            location: shiftTypeForm.location,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShiftTypes([...shiftTypes, data]);
      setShiftTypeForm({
        name: '',
        description: '',
        location: '',
      });
    } catch (err: any) {
      console.error('Error adding shift type:', err);
      setError('Failed to add shift type');
    }
  };

  const handleDeleteShiftType = async (shiftTypeId: string) => {
    if (!confirm('Are you sure you want to delete this shift type?')) return;

    try {
      const { error } = await supabase
        .from('shift_types')
        .delete()
        .eq('id', shiftTypeId);

      if (error) throw error;
      setShiftTypes(shiftTypes.filter((st) => st.id !== shiftTypeId));
    } catch (err: any) {
      console.error('Error deleting shift type:', err);
      setError('Failed to delete shift type');
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
          <Clock className="w-6 h-6" />
          Roster Management
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'shifts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Shifts
            </button>
            <button
              onClick={() => setActiveTab('shift_types')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'shift_types'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Shift Types
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'shifts' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Add New Shift</h2>
                  <form onSubmit={handleAddShift} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={shiftForm.name}
                        onChange={(e) =>
                          setShiftForm({ ...shiftForm, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={shiftForm.description}
                        onChange={(e) =>
                          setShiftForm({ ...shiftForm, description: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={shiftForm.start_time}
                          onChange={(e) =>
                            setShiftForm({ ...shiftForm, start_time: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={shiftForm.end_time}
                          onChange={(e) =>
                            setShiftForm({ ...shiftForm, end_time: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grace Period (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={shiftForm.grace_period}
                        onChange={(e) =>
                          setShiftForm({ ...shiftForm, grace_period: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minutes after shift start time to consider as late</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <select
                        value={shiftForm.color}
                        onChange={(e) =>
                          setShiftForm({ ...shiftForm, color: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      >
                        {FIXED_COLORS.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                      <div
                        className="mt-2 h-8 rounded-lg"
                        style={{ backgroundColor: shiftForm.color }}
                      ></div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Shift
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Existing Shifts</h2>
                {shifts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No shifts created yet
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: shift.color }}
                            ></div>
                            <h3 className="font-semibold">{shift.name}</h3>
                          </div>
                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {shift.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {shift.description}
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {shift.start_time} - {shift.end_time}
                        </p>
                        {shift.grace_period > 0 && (
                          <p className="text-xs text-gray-600">
                            Grace Period: {shift.grace_period} min
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Add New Shift Type</h2>
                  <form onSubmit={handleAddShiftType} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={shiftTypeForm.name}
                        onChange={(e) =>
                          setShiftTypeForm({ ...shiftTypeForm, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={shiftTypeForm.description}
                        onChange={(e) =>
                          setShiftTypeForm({
                            ...shiftTypeForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={shiftTypeForm.location}
                        onChange={(e) =>
                          setShiftTypeForm({
                            ...shiftTypeForm,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    <div className="p-3 bg-pink-100 rounded-lg border border-pink-200">
                      <p className="text-sm text-gray-700 mb-2">Color Preview:</p>
                      <div
                        className="h-8 rounded-lg"
                        style={{ backgroundColor: BUBBLEGUM_COLOR }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-1">
                        All shift types use bubblegum color
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Shift Type
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Existing Shift Types</h2>
                {shiftTypes.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No shift types created yet
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shiftTypes.map((shiftType) => (
                      <div
                        key={shiftType.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: BUBBLEGUM_COLOR }}
                            ></div>
                            <h3 className="font-semibold">{shiftType.name}</h3>
                          </div>
                          <button
                            onClick={() => handleDeleteShiftType(shiftType.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {shiftType.description && (
                          <p className="text-sm text-gray-600 mb-1">
                            {shiftType.description}
                          </p>
                        )}
                        {shiftType.location && (
                          <p className="text-sm text-gray-700">
                            Location: {shiftType.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
