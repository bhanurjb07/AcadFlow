import AttendanceSession from '../models/AttendanceSession';
import Attendance from '../models/Attendance';
import ClassSchedule from '../models/ClassSchedule';
import Student from '../models/Student';
import Seat from '../models/Seat';
import DailySeatAllocation from '../models/DailySeatAllocation';
import AuditLog from '../models/AuditLog';
import { emitAttendanceUpdate } from './socketService';
import QRCode from 'qrcode';
import { Types } from 'mongoose';

export class AttendanceService {
  async startSession(scheduleId: string, teacherId: string) {
    const schedule = await ClassSchedule.findById(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if session already exists for today & schedule
    let session = await AttendanceSession.findOne({
      scheduleId: new Types.ObjectId(scheduleId),
      date: today,
    });

    if (!session) {
      session = await AttendanceSession.create({
        scheduleId: schedule._id,
        subjectId: schedule.subjectId,
        teacherId: new Types.ObjectId(teacherId),
        classroomId: schedule.classroomId,
        date: today,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: 'open',
      });

      // Auto-populate initial absent attendance records for all students in that section
      const students = await Student.find({ section: schedule.section });
      const initialRecords = students.map((s) => ({
        sessionId: session!._id,
        studentId: s._id,
        subjectId: schedule.subjectId,
        date: today,
        status: 'absent',
        attendancePercentage: 0,
      }));

      if (initialRecords.length > 0) {
        await Attendance.insertMany(initialRecords);
      }
    }

    return await AttendanceSession.findById(session._id)
      .populate('subjectId', 'name code')
      .populate('classroomId', 'roomNumber block rows columns capacity')
      .populate('scheduleId');
  }

  async getSessionDetails(sessionId: string) {
    const session = await AttendanceSession.findById(sessionId)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name employeeId')
      .populate('classroomId')
      .populate('scheduleId');

    if (!session) throw new Error('Attendance session not found');

    const attendanceRecords = await Attendance.find({ sessionId: new Types.ObjectId(sessionId) })
      .populate('studentId', 'name rollNumber studentId profileImage section')
      .lean();

    return { session, attendanceRecords };
  }

  async markAttendance(
    sessionId: string,
    studentId: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    markedBy: string
  ) {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.status === 'locked') throw new Error('Cannot edit a locked session');

    const previous = await Attendance.findOne({
      sessionId: new Types.ObjectId(sessionId),
      studentId: new Types.ObjectId(studentId),
    });

    const updated = await Attendance.findOneAndUpdate(
      {
        sessionId: new Types.ObjectId(sessionId),
        studentId: new Types.ObjectId(studentId),
      },
      {
        status,
        markedBy: new Types.ObjectId(markedBy),
        markedAt: new Date(),
      },
      { new: true, upsert: true }
    ).populate('studentId', 'name rollNumber studentId');

    // Write audit log
    await AuditLog.create({
      action: 'UPDATE_ATTENDANCE',
      performedBy: new Types.ObjectId(markedBy),
      targetId: studentId,
      before: previous?.status,
      after: status,
      details: `Updated student status to ${status} in session ${sessionId}`,
    });

    // Real-time socket event
    emitAttendanceUpdate(sessionId, {
      studentId,
      status,
      record: updated,
    });

    return updated;
  }

  async batchUpdateAttendance(sessionId: string, records: { studentId: string; status: any }[], markedBy: string) {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.status === 'locked') throw new Error('Session is locked');

    const ops = records.map((r) =>
      Attendance.updateOne(
        { sessionId: new Types.ObjectId(sessionId), studentId: new Types.ObjectId(r.studentId) },
        { status: r.status, markedBy: new Types.ObjectId(markedBy), markedAt: new Date() },
        { upsert: true }
      )
    );

    await Promise.all(ops);

    emitAttendanceUpdate(sessionId, {
      batch: true,
      updatedCount: records.length,
    });

    return { success: true, count: records.length };
  }

  async lockSession(sessionId: string, userId: string) {
    const session = await AttendanceSession.findByIdAndUpdate(
      sessionId,
      { status: 'locked' },
      { new: true }
    );

    await AuditLog.create({
      action: 'LOCK_ATTENDANCE_SESSION',
      performedBy: new Types.ObjectId(userId),
      targetId: sessionId,
      details: `Session ${sessionId} locked`,
    });

    emitAttendanceUpdate(sessionId, { status: 'locked' });
    return session;
  }

  async generateQRCodes(sessionId: string) {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const qrData = JSON.stringify({
      sessionId: session._id,
      timestamp: Date.now(),
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);
    return { sessionId, qrCodeUrl };
  }
}

export default new AttendanceService();
