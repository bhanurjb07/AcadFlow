import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SeatMap } from '../../components/SeatMap';
import { Grid3X3, MapPin, Sparkles, User, Lock } from 'lucide-react';
import api from '../../api/client';

export const StudentSeat: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [seatAllocation, setSeatAllocation] = useState<any>(null);
  const [classroomGrid, setClassroomGrid] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, seatRes] = await Promise.all([
          api.get('/students/profile'),
          api.get('/students/seat/today'),
        ]);

        if (profRes.data.success) setProfile(profRes.data.data);
        if (seatRes.data.success && seatRes.data.data) {
          setSeatAllocation(seatRes.data.data);
          const cId = seatRes.data.data.classroomId?._id;
          if (cId) {
            const gridRes = await api.get(`/students/seating/${cId}`);
            if (gridRes.data.success) {
              setClassroomGrid(gridRes.data.data);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load seating layout:', err);
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Classroom Seat Locator
        </h1>
        <p className="text-sm text-slate-400">
          Live daily seating layout and allocated desk position.
        </p>
      </div>

      {seatAllocation ? (
        <div className="space-y-8">
          {/* Seat Banner */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center space-x-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/25">
                {seatAllocation.seatId?.seatNumber}
              </div>
              <div>
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 mb-1">
                  <span>● Allocated for Today</span>
                  {seatAllocation.seatId?.isPermanent && (
                    <span className="text-amber-400 flex items-center ml-2">
                      <Lock className="h-3 w-3 mr-1" /> Permanent
                    </span>
                  )}
                </span>
                <h2 className="text-xl font-bold text-white">
                  Room {seatAllocation.classroomId?.roomNumber} ({seatAllocation.classroomId?.block})
                </h2>
                <p className="text-xs text-slate-400">
                  Floor {seatAllocation.classroomId?.floor} • Row {seatAllocation.seatId?.row}, Desk {seatAllocation.seatId?.column}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Allocation Mode</div>
                <div className="text-sm font-bold text-indigo-400 uppercase">
                  {seatAllocation.allocationType} Mode
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Classroom Grid */}
          {classroomGrid && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="font-bold text-lg text-white">
                  Classroom Layout — {classroomGrid.classroom?.roomNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Your seat is highlighted with green borders below.
                </p>
              </div>

              <SeatMap
                seats={classroomGrid.seats || []}
                rows={classroomGrid.classroom?.rows || 4}
                columns={classroomGrid.classroom?.columns || 5}
                highlightStudentId={profile?._id}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-12 text-center space-y-3">
          <Grid3X3 className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Seat Allocation Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            The administrator has not generated the seating chart for your section today. Please check back before your lecture.
          </p>
        </div>
      )}
    </div>
  );
};
