import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, AlertCircle, Check, Search, ShieldCheck } from 'lucide-react';
import api from '../../api/client';

export const AdminSubstitution: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [absentTeacherId, setAbsentTeacherId] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [teachRes, subRes, schRes] = await Promise.all([
          api.get('/admin/teachers'),
          api.get('/admin/subjects'),
          api.get('/admin/schedules'),
        ]);

        if (teachRes.data.success) {
          setTeachers(teachRes.data.data);
          if (teachRes.data.data.length > 0) {
            setAbsentTeacherId(teachRes.data.data[0]._id);
          }
        }
        if (subRes.data.success) setSubjects(subRes.data.data);
        if (schRes.data.success) {
          setSchedules(schRes.data.data);
          if (schRes.data.data.length > 0) {
            setSelectedScheduleId(schRes.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load substitution data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleFindCandidates = async () => {
    const schedule = schedules.find((s) => s._id === selectedScheduleId);
    if (!schedule || !absentTeacherId) return;

    setSearching(true);
    try {
      const res = await api.post('/admin/substitution/candidates', {
        absentTeacherId,
        day: schedule.day,
        period: schedule.period,
        subjectId: schedule.subjectId?._id || schedule.subjectId,
      });

      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to search candidate substitutes');
    } finally {
      setSearching(false);
    }
  };

  const handleAssignSubstitute = async (substituteTeacherId: string) => {
    const schedule = schedules.find((s) => s._id === selectedScheduleId);
    if (!schedule) return;

    setAssigning(true);
    try {
      const res = await api.post('/admin/substitution/assign', {
        absentTeacherId,
        substituteTeacherId,
        classScheduleId: schedule._id,
        subjectId: schedule.subjectId?._id || schedule.subjectId,
        date: new Date().toISOString(),
        reason: 'Staff leave / urgent substitution',
      });

      if (res.data.success) {
        alert('Faculty substitution assigned and real-time notification sent to substitute!');
        setCandidates([]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign substitute');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const selectedSchedule = schedules.find((s) => s._id === selectedScheduleId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Smart Faculty Substitution Engine
        </h1>
        <p className="text-sm text-slate-400">
          Rank available substitute professors based on subject domain match, department affiliation, and timetable free periods.
        </p>
      </div>

      {/* Query Form */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Absent Faculty Member
            </label>
            <select
              value={absentTeacherId}
              onChange={(e) => setAbsentTeacherId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
            >
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.employeeId} - {t.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Target Lecture / Schedule
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
            >
              {schedules.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectId?.name} — {s.day} (Period {s.period}, {s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400">
            Target Period: <b>{selectedSchedule?.day} P{selectedSchedule?.period}</b> ({selectedSchedule?.startTime} - {selectedSchedule?.endTime})
          </div>

          <button
            onClick={handleFindCandidates}
            disabled={searching}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span>{searching ? 'Evaluating Candidates...' : 'Rank & Match Substitutes'}</span>
          </button>
        </div>
      </div>

      {/* Candidate Ranking List */}
      {candidates.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">AI-Ranked Substitute Recommendations</h2>
          </div>

          <div className="space-y-3">
            {candidates.map((cand, idx) => {
              const isBest = idx === 0 && cand.isFree;
              return (
                <div
                  key={cand.teacher._id}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    !cand.isFree
                      ? 'border-slate-800/40 bg-slate-950/30 opacity-60'
                      : isBest
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm ${
                        cand.isFree
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{cand.teacher.name}</span>
                        {isBest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                            ★ TOP MATCH
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {cand.teacher.department} • Teaches: {cand.teacher.subjects?.join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-indigo-300">
                        {cand.recommendation}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Score: {cand.score} pts
                      </div>
                    </div>

                    <button
                      disabled={!cand.isFree || assigning}
                      onClick={() => handleAssignSubstitute(cand.teacher._id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        cand.isFree
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {cand.isFree ? 'Assign Substitute' : 'Busy Period'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
