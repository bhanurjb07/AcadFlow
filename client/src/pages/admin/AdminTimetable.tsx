import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, User, BookOpen } from 'lucide-react';
import api from '../../api/client';

export const AdminTimetable: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newSchedule, setNewSchedule] = useState({
    subjectId: '',
    teacherId: '',
    classroomId: '',
    section: 'CS-A',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    period: 1,
  });

  const fetchData = async () => {
    try {
      const [schRes, subRes, teachRes, crRes] = await Promise.all([
        api.get('/admin/schedules'),
        api.get('/admin/subjects'),
        api.get('/admin/teachers'),
        api.get('/admin/classrooms'),
      ]);

      if (schRes.data.success) setSchedules(schRes.data.data);
      if (subRes.data.success) {
        setSubjects(subRes.data.data);
        if (subRes.data.data.length > 0) setNewSchedule((p) => ({ ...p, subjectId: subRes.data.data[0]._id }));
      }
      if (teachRes.data.success) {
        setTeachers(teachRes.data.data);
        if (teachRes.data.data.length > 0) setNewSchedule((p) => ({ ...p, teacherId: teachRes.data.data[0]._id }));
      }
      if (crRes.data.success) {
        setClassrooms(crRes.data.data);
        if (crRes.data.data.length > 0) setNewSchedule((p) => ({ ...p, classroomId: crRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load timetable manager:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/schedules', newSchedule);
      if (res.data.success) {
        alert('Lecture schedule period added!');
        setShowModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create schedule');
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Master Timetable & Period Scheduler
          </h1>
          <p className="text-sm text-slate-400">
            Configure lecture slots, assigned lecture halls, faculty, and academic sections.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Lecture Slot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day) => {
          const daySlots = schedules.filter((s) => s.day === day);
          return (
            <div
              key={day}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl"
            >
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-indigo-400">{day}</h3>
                <span className="text-xs text-slate-500">{daySlots.length} lecture slots</span>
              </div>

              <div className="space-y-3">
                {daySlots.map((c) => (
                  <div
                    key={c._id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold uppercase">
                      <span>Period {c.period}</span>
                      <span className="text-slate-400">{c.section}</span>
                    </div>
                    <div className="font-semibold text-xs text-white">{c.subjectId?.name}</div>
                    <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5 flex justify-between">
                      <span>{c.teacherId?.name}</span>
                      <span className="text-indigo-300">Rm {c.classroomId?.roomNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {c.startTime} - {c.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Lecture Slot</h3>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                <select
                  required
                  value={newSchedule.subjectId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, subjectId: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Faculty</label>
                  <select
                    required
                    value={newSchedule.teacherId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, teacherId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  >
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Classroom</label>
                  <select
                    required
                    value={newSchedule.classroomId}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, classroomId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  >
                    {classrooms.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.roomNumber} ({c.capacity} cap)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Day</label>
                  <select
                    value={newSchedule.day}
                    onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Period</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={newSchedule.period}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, period: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={newSchedule.section}
                    onChange={(e) => setNewSchedule({ ...newSchedule, section: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/20"
                >
                  Save Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
