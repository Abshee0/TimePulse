import React from 'react';
import { Download } from 'lucide-react';

export default function DownloadDutyRosterPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Download className="w-6 h-6" />
          Download Duty Roster
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Download duty roster functionality coming soon...</p>
      </div>
    </div>
  );
}
