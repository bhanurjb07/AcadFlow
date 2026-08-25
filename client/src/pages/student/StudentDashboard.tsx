import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  Award,
  Grid3X3,
  Clock,
  BookOpen,
  MapPin,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/client';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [seat, setSeat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, attRes, classRes, seatRes] = await Promise.all([
          api.get('/students/profile'),
          api.get('/students/attendance'),
          api.get('/students/classes/today'),
          api.get('/students/seat/today'),
        ]);

        if (profRes.data.success) setProfile(profRes.data.data);
        if (attRes.data.success) setAttendance(attRes.data.data);
        if (classRes.data.success) setTodayClasses(classRes.data.data);
        if (seatRes.data.success) setSeat(seatRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const attPercent = attendance?.attendancePercentage || 0;
  const isAttendanceLow = attPercent < 75;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
              <span>Section: {profile?.section || 'CS-A'}</span>
              <span>•</span>
              <span>Roll No: {profile?.rollNumber || '24CS001'}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.name || user?.name}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Here is your academic overview, today's timetable, and live seat allocation.
            </p>
          </div>

          {/* Quick Attendance Gauge */}
          <div className="flex items-center space-x-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="relative flex items-center justify-center">
              <div
                className={`text-2xl font-black ${
                  isAttendanceLow ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {attPercent}%
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-300">Overall Attendance</div>
              <div className="text-[11px] text-slate-500">
                {attendance?.present || 0} / {attendance?.total || 0} sessions attended
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Attendance Health
            </span>
            <CalendarCheck
              className={`h-5 w-5 ${isAttendanceLow ? 'text-amber-400' : 'text-emerald-400'}`}
            />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{attPercent}%</span>
            <span className="text-xs text-slate-500">Target: ≥ 75%</span>
          </div>
          {isAttendanceLow ? (
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Warning: Below 75% examination eligibility limit</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-400/90 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Great job! Eligible for examinations</span>
            </div>
          )}
        </div>

        {/* Daily Seat Allocation Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today's Seat
            </span>
            <Grid3X3 className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            {seat ? (
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                  {seat.seatId?.seatNumber}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {seat.classroomId?.roomNumber} ({seat.classroomId?.block})
                  </div>
                  <div className="text-xs text-indigo-400">
                    Row {seat.seatId?.row}, Column {seat.seatId?.column} • {seat.allocationType}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-2">
                No seat assigned yet for today
              </div>
            )}
          </div>
        </div>

        {/* Next Class Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today's Schedule
            </span>
            <Clock className="h-5 w-5 text-violet-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white">{todayClasses.length}</div>
            <div className="text-xs text-slate-500 mt-1">Lectures scheduled for today</div>
          </div>
        </div>
      </div>

      {/* Today's Lectures Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Today's Class Schedule</h2>
            <p className="text-xs text-slate-400">Live lecture sequence and room assignments</p>
          </div>
        </div>

        {todayClasses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No classes scheduled for today. Enjoy your day! 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayClasses.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-sm border border-indigo-500/20">
                    P{c.period}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{c.subjectId?.name}</h3>
                    <p className="text-xs text-slate-400">
                      {c.teacherId?.name} • Room {c.classroomId?.roomNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                    {c.startTime} - {c.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
