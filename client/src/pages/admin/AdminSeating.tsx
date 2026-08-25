import React, { useState, useEffect } from 'react';
import { Shuffle, Check, Sparkles, Building, Lock } from 'lucide-react';
import { SeatMap } from '../../components/SeatMap';
import api from '../../api/client';

export const AdminSeating: React.FC = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [section, setSection] = useState('CS-A');
  const [allocationType, setAllocationType] = useState<'random' | 'permanent'>('random');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gridData, setGridData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await api.get('/admin/classrooms');
        if (res.data.success) {
          setClassrooms(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedClassroomId(res.data.data[0]._id);
            fetchGrid(res.data.data[0]._id, date);
          }
        }
      } catch (err) {
        console.error('Failed to load classrooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  const fetchGrid = async (cId: string, dStr: string) => {
    try {
      const res = await api.get(`/admin/seating/${cId}?date=${dStr}`);
      if (res.data.success) {
        setGridData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch grid:', err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedClassroomId) return;
    setGenerating(true);
    try {
      const res = await api.post('/admin/seating/generate', {
        classroomId: selectedClassroomId,
        section,
        allocationType,
        date,
      });
      if (res.data.success) {
        setGridData(res.data.data);
        alert(`Successfully generated ${allocationType} seating for Section ${section}!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate seating');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const selectedClassroom = classrooms.find((c) => c._id === selectedClassroomId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Automated Classroom Seating Generator
        </h1>
        <p className="text-sm text-slate-400">
          Generate fair random seat distributions or enforce permanent desk allocations with one click.
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Classroom</label>
            <select
              value={selectedClassroomId}
              onChange={(e) => {
                setSelectedClassroomId(e.target.value);
                fetchGrid(e.target.value, date);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.roomNumber} ({c.capacity} capacity)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="CS-A">CS-A (Computer Science)</option>
              <option value="CS-B">CS-B (Computer Science)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Allocation Mode
            </label>
            <select
              value={allocationType}
              onChange={(e) => setAllocationType(e.target.value as any)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="random">🎲 Random Fisher-Yates Shuffle</option>
              <option value="permanent">📌 Permanent Assigned Seats</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchGrid(selectedClassroomId, e.target.value);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-5">
          <span className="text-xs text-slate-400">
            Selected Hall: <b>{selectedClassroom?.roomNumber}</b> ({selectedClassroom?.capacity} seats)
          </span>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4" />
            <span>{generating ? 'Calculating Allocation...' : 'Generate Today\'s Seating Chart'}</span>
          </button>
        </div>
      </div>

      {/* Seating Grid Preview */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">
            Allocated Seating Layout — {selectedClassroom?.roomNumber}
          </h2>
          <p className="text-xs text-slate-400">
            Date: {new Date(date).toLocaleDateString()} • Mode: <span className="uppercase text-purple-400 font-bold">{allocationType}</span>
          </p>
        </div>

        {gridData ? (
          <SeatMap
            seats={gridData.seats || []}
            rows={selectedClassroom?.rows || 4}
            columns={selectedClassroom?.columns || 5}
          />
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">
            No allocation found for this date. Click the generate button above.
          </div>
        )}
      </div>
    </div>
  );
};
