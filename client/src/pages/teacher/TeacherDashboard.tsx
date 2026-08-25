import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Play,
  Clock,
  BookOpen,
  CalendarCheck,
  UserCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/teachers/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleStartAttendance = async (scheduleId: string) => {
    setStartingSessionId(scheduleId);
    try {
      const res = await api.post('/attendance/start', { scheduleId });
      if (res.data.success) {
        navigate(`/teacher/attendance/${res.data.data._id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start session');
    } finally {
      setStartingSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const regularClasses = data?.todayData?.regularClasses || [];
  const substitutionClasses = data?.todayData?.substitutionClasses || [];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/20 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-3">
              <span>Faculty Dashboard</span>
              <span>•</span>
              <span>Computer Science Dept</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name}! 🎓
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Start live attendance sessions, verify student seats, and input test grades.
            </p>
          </div>
        </div>
      </div>

      {/* Substitution Alert Banner if any */}
      {substitutionClasses.length > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 flex items-start space-x-4">
          <UserCheck className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-amber-300">
              Substitution Class Assigned Today!
            </h3>
            <p className="text-xs text-amber-200/80">
              You have been designated to cover {substitutionClasses.length} lecture(s) on behalf of an absent faculty member.
            </p>
          </div>
        </div>
      )}

      {/* Today's Lectures List with Live Start Attendance buttons */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Today's Teaching Schedule</h2>
            <p className="text-xs text-slate-400">Launch live attendance sessions directly below</p>
          </div>
        </div>

        {regularClasses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No lectures scheduled for you today.
          </div>
        ) : (
          <div className="space-y-4">
            {regularClasses.map((c: any) => (
              <div
                key={c._id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-bold text-base border border-blue-500/20">
                    P{c.period}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{c.subjectId?.name}</h3>
                    <p className="text-xs text-slate-400">
                      Code: {c.subjectId?.code} • Section: <span className="text-indigo-300 font-semibold">{c.section}</span> • Room {c.classroomId?.roomNumber}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{c.startTime} - {c.endTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleStartAttendance(c._id)}
                    disabled={startingSessionId === c._id}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>{startingSessionId === c._id ? 'Starting...' : 'Take Attendance'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Attendance Logs</h2>
        <div className="divide-y divide-slate-800">
          {(data?.recentSessions || []).map((sess: any) => (
            <div key={sess._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">{sess.subjectId?.name}</div>
                <div className="text-xs text-slate-400">
                  {new Date(sess.date).toLocaleDateString()} • Room {sess.classroomId?.roomNumber}
                </div>
              </div>
              <button
                onClick={() => navigate(`/teacher/attendance/${sess._id}`)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View Session →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
