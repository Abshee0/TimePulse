import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart,
  Upload,
  Download,
  Settings,
  LogOut,
  PlaneTakeoff,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  Calendar,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
}

export default function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Attendance', 'Roster', 'Leave']);

  const menuItems: MenuItem[] = [
    { path: '/', label: 'Dashboard', icon: Users },
    { path: '/employees', label: 'Employees', icon: Users },
    {
      label: 'Attendance',
      icon: BarChart,
      children: [
        { path: '/attendance-view', label: 'View Attendance', icon: BarChart },
        { path: '/attendance-upload', label: 'Upload Attendance', icon: Upload },
        { path: '/attendance-download', label: 'Download Attendance', icon: Download },
      ],
    },
    {
      label: 'Roster',
      icon: CalendarClock,
      children: [
        { path: '/duty-roster', label: 'Duty Roster', icon: CalendarClock },
        { path: '/duty-roster-view', label: 'View Duty Roster', icon: CalendarDays },
        { path: '/download-duty-roster', label: 'Download Duty Roster', icon: FileSpreadsheet },
      ],
    },
    {
      label: 'Leave',
      icon: PlaneTakeoff,
      children: [
        { path: '/leave-manager', label: 'Leave Manager', icon: PlaneTakeoff },
        { path: '/calendar-view', label: 'Leave Calendar', icon: Calendar },
      ],
    },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path?: string) => path && location.pathname === path;
  const isChildActive = (children?: MenuItem[]) =>
    children && children.some((child) => child.path && location.pathname === child.path);

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = item.icon;

    if (item.children) {
      const isExpanded = expandedSections.includes(item.label);
      const hasActiveChild = isChildActive(item.children);

      return (
        <div key={item.label}>
          <button
            onClick={() => toggleSection(item.label)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
              hasActiveChild || isExpanded
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {isExpanded && (
            <ul className="space-y-1 mt-1 ml-2 border-l-2 border-blue-200 pl-2">
              {item.children.map((child) => renderMenuItem(child, true))}
            </ul>
          )}
        </div>
      );
    }

    return (
      <li key={item.path}>
        <Link
          to={item.path || '#'}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive(item.path)
              ? 'bg-blue-600 text-white'
              : isChild
              ? 'text-gray-700 hover:bg-gray-100 text-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="w-64 bg-white shadow-lg fixed left-0 top-0 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Attendance</h2>
        {user?.email && <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.label || item.path}>{renderMenuItem(item)}</div>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
