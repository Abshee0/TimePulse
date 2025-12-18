import React from 'react';
import { Settings, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
        <Link
          to="/settings/roster-management"
          className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Roster Management</h3>
              <p className="text-sm text-gray-600">
                Configure shifts and shift types for duty roster
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
