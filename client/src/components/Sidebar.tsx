import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Calendar,
  Grid3X3,
  Users,
  BookOpen,
  Building,
  UserCheck,
  Award,
  Bell,
  Clock,
  Shuffle,
  BarChart3,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const getStudentLinks = () => [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/student/timetable', label: 'Timetable', icon: Calendar },
    { to: '/student/seat', label: 'My Seat', icon: Grid3X3 },
    { to: '/student/exams', label: 'Exams & Marks', icon: Award },
  ];

  const getTeacherLinks = () => [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/marks', label: 'Grading & Marks', icon: Award },
    { to: '/teacher/availability', label: 'My Availability', icon: Clock },
  ];

  const getAdminLinks = () => [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/classrooms', label: 'Classrooms & Seats', icon: Building },
    { to: '/admin/seating', label: 'Daily Seating Generator', icon: Shuffle },
    { to: '/admin/substitution', label: 'Smart Substitution', icon: UserCheck },
    { to: '/admin/timetable', label: 'Schedules & Timetable', icon: Calendar },
    { to: '/admin/staff', label: 'Students & Faculty', icon: Users },
    { to: '/admin/notices', label: 'Bulletins & Notices', icon: Bell },
  ];

  const links =
    user?.role === 'admin'
      ? getAdminLinks()
      : user?.role === 'teacher'
      ? getTeacherLinks()
      : getStudentLinks();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {user?.role?.toUpperCase()} PORTAL
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-1">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>System Status</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Server: Operational</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
};
