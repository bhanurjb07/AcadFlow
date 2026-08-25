import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket } from '../../socket';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  QrCode,
  Users,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/client';

export const TeacherAttendanceSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await api.get(`/attendance/${sessionId}`);
      if (res.data.success) {
        setSessionData(res.data.data.session);
        setAttendanceRecords(res.data.data.attendanceRecords);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // Socket.IO real-time connection
    const socket = getSocket();
    socket.emit('join:attendance', sessionId);

    socket.on('attendance:update', (payload: any) => {
      if (payload.record) {
        setAttendanceRecords((prev) =>
          prev.map((r) =>
            r.studentId?._id === payload.studentId || r.studentId === payload.studentId
              ? { ...r, status: payload.status }
              : r
          )
        );
      }
    });

    return () => {
      socket.off('attendance:update');
    };
  }, [sessionId]);

  const handleStatusChange = async (studentId: string, status: string) => {
    try {
      // Optimistic UI update
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          r.studentId?._id === studentId ? { ...r, status } : r
        )
      );

      await api.patch('/attendance/mark', {
        sessionId,
        studentId,
        status,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update attendance');
      fetchSession();
    }
  };

  const handleMarkAllPresent = async () => {
    const records = attendanceRecords.map((r) => ({
      studentId: r.studentId?._id,
      status: 'present',
    }));

    try {
      setAttendanceRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })));
      await api.patch('/attendance/batch', { sessionId, records });
    } catch (err: any) {
      alert('Batch update failed');
      fetchSession();
    }
  };

  const handleLockSession = async () => {
    if (!window.confirm('Locking this session will finalize all records and prevent further edits. Proceed?')) {
      return;
    }
    try {
      const res = await api.patch(`/attendance/${sessionId}/lock`);
      if (res.data.success) {
        setSessionData((prev: any) => ({ ...prev, status: 'locked' }));
        alert('Attendance session successfully locked.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to lock session');
    }
  };

  const handleGenerateQR = async () => {
    try {
      const res = await api.get(`/attendance/${sessionId}/qr`);
      if (res.data.success) {
        setQrCodeUrl(res.data.data.qrCodeUrl);
        setShowQrModal(true);
      }
    } catch (err) {
      alert('Failed to generate QR Code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'absent').length;
  const totalStudents = attendanceRecords.length;
  const isLocked = sessionData?.status === 'locked';

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">
                {sessionData?.subjectId?.name} ({sessionData?.subjectId?.code})
              </h1>
              {isLocked ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Lock className="h-3 w-3 mr-1" /> LOCKED
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● LIVE SESSION
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Room {sessionData?.classroomId?.roomNumber} • Date: {new Date(sessionData?.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateQR}
            className="flex items-center space-x-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <QrCode className="h-4 w-4 text-indigo-400" />
            <span>Show QR Code</span>
          </button>

          {!isLocked && (
            <>
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center space-x-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 transition-colors"
              >
                <span>Mark All Present</span>
              </button>
              <button
                onClick={handleLockSession}
                className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>Finalize & Lock</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
          <span className="text-xs text-slate-400 font-medium">Total Enrolled</span>
          <div className="text-2xl font-bold text-white mt-1">{totalStudents}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
          <span className="text-xs text-slate-400 font-medium">Present</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{presentCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
          <span className="text-xs text-slate-400 font-medium">Late</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{lateCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
          <span className="text-xs text-slate-400 font-medium">Absent</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{absentCount}</div>
        </div>
      </div>

      {/* Student Attendance Roster */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white">Student Attendance Roster</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendanceRecords.map((r) => {
                const s = r.studentId;
                return (
                  <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-xs">
                        {s?.name ? s.name[0] : 'S'}
                      </div>
                      <span className="font-semibold text-white">{s?.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{s?.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-400">{s?.section}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        {['present', 'late', 'absent'].map((st) => (
                          <button
                            key={st}
                            disabled={isLocked}
                            onClick={() => handleStatusChange(s?._id, st)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                              r.status === st
                                ? st === 'present'
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                  : st === 'late'
                                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                  : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            } disabled:opacity-60`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCodeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Classroom Attendance QR</h3>
            <p className="text-xs text-slate-400">
              Project this QR Code on the classroom display for automated student self check-in.
            </p>
            <div className="flex justify-center p-4 bg-white rounded-2xl">
              <img src={qrCodeUrl} alt="Attendance QR Code" className="h-48 w-48" />
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
