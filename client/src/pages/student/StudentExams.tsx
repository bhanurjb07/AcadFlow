import React, { useState, useEffect } from 'react';
import { Award, Calendar, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/client';

export const StudentExams: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/students/exams');
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load exam results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
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
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Exams & Academic Performance
        </h1>
        <p className="text-sm text-slate-400">
          Review your scored exam marks, letter grades, and subject evaluations.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Graded Exam Results</h2>

        {results.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No graded exam records found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Exam Date</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {r.examId?.subjectId?.name} ({r.examId?.subjectId?.code})
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(r.examId?.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.examId?.maxMarks}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {r.marksObtained} / {r.examId?.maxMarks}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
