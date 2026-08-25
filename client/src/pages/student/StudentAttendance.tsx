import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';
import api from '../../api/client';

export const StudentAttendance: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/students/attendance');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const breakdown = data?.subjectBreakdown || [];
  const records = data?.records || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Attendance Analytics & Breakdown
        </h1>
        <p className="text-sm text-slate-400">
          Track subject-wise eligibility and review attendance audit logs.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 font-medium">Overall Rate</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {data?.attendancePercentage}%
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 font-medium">Total Sessions</span>
          <div className="text-2xl font-extrabold text-white mt-1">{data?.total || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 font-medium">Present</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{data?.present || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 font-medium">Absent</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{data?.absent || 0}</div>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-lg font-bold text-white">Subject-wise Eligibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakdown.map((item: any, idx: number) => {
            const isLow = item.percentage < 75;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-white">
                      {item.subject?.name || 'Subject'}
                    </h3>
                    <p className="text-xs text-slate-500">{item.subject?.code}</p>
                  </div>
                  <span
                    className={`text-lg font-extrabold ${
                      isLow ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Attended {item.attended} of {item.total} lectures
                  </span>
                  <span>{isLow ? '⚠️ Below 75%' : '✓ Eligible'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Log History */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Session Attendance Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Marked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.slice(0, 15).map((r: any) => (
                <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">
                    {r.subjectId?.name} ({r.subjectId?.code})
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === 'present'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : r.status === 'late'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {r.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : 'Auto-recorded'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
