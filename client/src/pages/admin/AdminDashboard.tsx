import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Building,
  BookOpen,
  Calendar,
  Shuffle,
  UserCheck,
  TrendingUp,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/client';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/20 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Institute Administration Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Administrator Dashboard 🏛️
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live statistics, classroom utilization, audit logs, and faculty substitution workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Students Enrolled
            </span>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">{stats?.totalStudents || 0}</div>
          <div className="text-xs text-indigo-400 mt-1">Active registered students</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Teaching Faculty
            </span>
            <UserCheck className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">{stats?.totalTeachers || 0}</div>
          <div className="text-xs text-blue-400 mt-1">Professors & Instructors</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Classrooms Configured
            </span>
            <Building className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">{stats?.totalClassrooms || 0}</div>
          <div className="text-xs text-purple-400 mt-1">Lecture halls with seat maps</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg Attendance Rate
            </span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-4">
            {stats?.overallAttendanceRate || 85}%
          </div>
          <div className="text-xs text-emerald-400/80 mt-1">Institute-wide metric</div>
        </div>
      </div>

      {/* Recent Substitution Allocations */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Staff Substitution Assignments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Absent Faculty</th>
                <th className="py-3 px-4">Assigned Substitute</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(stats?.recentSubstitutions || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                    No substitution assignments recorded yet.
                  </td>
                </tr>
              ) : (
                stats?.recentSubstitutions.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">
                      {sub.subjectId?.name} ({sub.subjectId?.code})
                    </td>
                    <td className="py-3 px-4 text-rose-400">{sub.absentTeacherId?.name}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">
                      {sub.substituteTeacherId?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(sub.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Activity */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">System Security & Audit Trail</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {(stats?.recentLogs || []).map((log: any) => (
            <div key={log._id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">{log.action}</span>
                <span className="text-slate-400 ml-2">{log.details}</span>
              </div>
              <div className="text-slate-500">
                {new Date(log.createdAt).toLocaleTimeString()} by {log.performedBy?.name || 'System'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
