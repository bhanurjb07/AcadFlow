import React, { useState, useEffect } from 'react';
import { Award, Plus, Check, Search } from 'lucide-react';
import api from '../../api/client';

export const TeacherMarks: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [marksState, setMarksState] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // Create exam modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExam, setNewExam] = useState({
    subjectId: '',
    classScheduleId: '',
    date: new Date().toISOString().split('T')[0],
    maxMarks: 100,
    durationMinutes: 120,
  });

  const fetchData = async () => {
    try {
      const [examRes, subRes, schRes, stuRes] = await Promise.all([
        api.get('/exams'),
        api.get('/admin/subjects'),
        api.get('/admin/schedules'),
        api.get('/admin/students'),
      ]);

      if (examRes.data.success) {
        setExams(examRes.data.data);
        if (examRes.data.data.length > 0) {
          setSelectedExamId(examRes.data.data[0]._id);
        }
      }
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (schRes.data.success) setSchedules(schRes.data.data);
      if (stuRes.data.success) setStudents(stuRes.data.data);
    } catch (err) {
      console.error('Failed to load marks page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/exams', newExam);
      if (res.data.success) {
        alert('Exam created successfully');
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create exam');
    }
  };

  const handleMarksChange = (studentId: string, val: string) => {
    const num = Number(val);
    setMarksState((prev) => ({ ...prev, [studentId]: num }));
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId) return;
    setSaving(true);

    const payload = Object.entries(marksState).map(([studentId, marksObtained]) => ({
      studentId,
      marksObtained,
    }));

    try {
      const res = await api.post('/exams/marks', {
        examId: selectedExamId,
        results: payload,
      });
      if (res.data.success) {
        alert('Marks successfully recorded and graded!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const currentExam = exams.find((e) => e._id === selectedExamId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Exam Grading & Evaluation
          </h1>
          <p className="text-sm text-slate-400">
            Record student marks with automated letter grade calculation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Examination</span>
        </button>
      </div>

      {/* Select Exam Dropdown */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-400">Select Exam:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.subjectId?.name} — Max: {ex.maxMarks} marks ({new Date(ex.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveMarks}
            disabled={saving || !selectedExamId}
            className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Submit & Save Marks'}</span>
          </button>
        </div>

        {/* Student Gradebook Input Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Score (Max: {currentExam?.maxMarks || 100})</th>
                <th className="py-3 px-4">Calculated Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((s) => {
                const score = marksState[s._id] !== undefined ? marksState[s._id] : 0;
                const max = currentExam?.maxMarks || 100;
                const pct = (score / max) * 100;
                let grade = 'F';
                if (pct >= 90) grade = 'A+';
                else if (pct >= 80) grade = 'A';
                else if (pct >= 70) grade = 'B';
                else if (pct >= 60) grade = 'C';
                else if (pct >= 50) grade = 'D';

                return (
                  <tr key={s._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-3 px-4 text-slate-400">{s.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-400">{s.section}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max={max}
                        value={marksState[s._id] !== undefined ? marksState[s._id] : ''}
                        onChange={(e) => handleMarksChange(s._id, e.target.value)}
                        placeholder="0"
                        className="w-24 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to create new Exam */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Exam</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                <select
                  required
                  value={newExam.subjectId}
                  onChange={(e) => setNewExam({ ...newExam, subjectId: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Class Schedule</label>
                <select
                  required
                  value={newExam.classScheduleId}
                  onChange={(e) => setNewExam({ ...newExam, classScheduleId: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  <option value="">Select class schedule...</option>
                  {schedules.map((sch) => (
                    <option key={sch._id} value={sch._id}>
                      {sch.subjectId?.name} — {sch.day} Period {sch.period} ({sch.section})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={newExam.maxMarks}
                    onChange={(e) => setNewExam({ ...newExam, maxMarks: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={newExam.durationMinutes}
                    onChange={(e) =>
                      setNewExam({ ...newExam, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
