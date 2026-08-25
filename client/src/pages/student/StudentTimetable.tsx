import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import api from '../../api/client';

export const StudentTimetable: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/students/timetable');
        if (res.data.success) {
          setSchedules(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Weekly Academic Timetable
        </h1>
        <p className="text-sm text-slate-400">
          Complete weekly lecture schedule with assigned rooms and faculty.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day) => {
          const dayClasses = schedules.filter((s) => s.day === day);
          return (
            <div
              key={day}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl"
            >
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-indigo-400">{day}</h3>
                <span className="text-xs text-slate-500">{dayClasses.length} lectures</span>
              </div>

              <div className="space-y-3">
                {dayClasses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-600">No classes</div>
                ) : (
                  dayClasses.map((c) => (
                    <div
                      key={c._id}
                      className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          Period {c.period}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.startTime} - {c.endTime}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-white line-clamp-1">
                        {c.subjectId?.name}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>{c.teacherId?.name}</span>
                        <span className="text-indigo-300">Room {c.classroomId?.roomNumber}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
