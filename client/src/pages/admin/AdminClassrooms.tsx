import React, { useState, useEffect } from 'react';
import { Building, Plus, Grid3X3, Eye } from 'lucide-react';
import { SeatMap } from '../../components/SeatMap';
import api from '../../api/client';

export const AdminClassrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  const [previewGrid, setPreviewGrid] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New classroom modal
  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    block: 'Block A',
    floor: '1st Floor',
    rows: 4,
    columns: 5,
  });

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/admin/classrooms');
      if (res.data.success) {
        setClassrooms(res.data.data);
        if (res.data.data.length > 0 && !selectedClassroom) {
          handleSelectClassroom(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleSelectClassroom = async (c: any) => {
    setSelectedClassroom(c);
    try {
      const res = await api.get(`/admin/seating/${c._id}`);
      if (res.data.success) {
        setPreviewGrid(res.data.data);
      }
    } catch (err) {
      console.error('Failed to preview seats:', err);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/classrooms', newRoom);
      if (res.data.success) {
        alert('Classroom and seat grid configured successfully!');
        setShowModal(false);
        fetchClassrooms();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create classroom');
    }
  };

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
            Classroom & Physical Seat Layout Editor
          </h1>
          <p className="text-sm text-slate-400">
            Define lecture halls, row/column dimensions, and capacity matrices.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Classroom</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classrooms list */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Configured Classrooms</h2>
          <div className="space-y-3">
            {classrooms.map((c) => {
              const isSelected = selectedClassroom?._id === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => handleSelectClassroom(c)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-white">{c.roomNumber}</span>
                    <span className="text-xs text-purple-400 font-semibold">
                      {c.capacity} Desks
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {c.block} • {c.floor} • {c.rows} Rows × {c.columns} Columns
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Seating Layout Visualizer */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-white">
                Seat Matrix: {selectedClassroom?.roomNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Grid: {selectedClassroom?.rows} Rows × {selectedClassroom?.columns} Columns ({selectedClassroom?.capacity} total capacity)
              </p>
            </div>
          </div>

          {previewGrid ? (
            <SeatMap
              seats={previewGrid.seats || []}
              rows={selectedClassroom?.rows || 4}
              columns={selectedClassroom?.columns || 5}
            />
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              Select a classroom to preview its physical layout.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Classroom</h3>
            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Room Number / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LH-301"
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Block</label>
                  <input
                    type="text"
                    required
                    value={newRoom.block}
                    onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Floor</label>
                  <input
                    type="text"
                    required
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newRoom.rows}
                    onChange={(e) => setNewRoom({ ...newRoom, rows: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newRoom.columns}
                    onChange={(e) => setNewRoom({ ...newRoom, columns: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                Calculated Total Capacity: <b>{newRoom.rows * newRoom.columns} Seats</b>
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
                  className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-md shadow-purple-600/20"
                >
                  Save & Generate Grid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
