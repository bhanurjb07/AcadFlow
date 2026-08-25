import Attendance from '../models/Attendance';
import AttendanceSession from '../models/AttendanceSession';
import ExamResult from '../models/ExamResult';
import ClassSchedule from '../models/ClassSchedule';
import Student from '../models/Student';
import DailySeatAllocation from '../models/DailySeatAllocation';
import Subject from '../models/Subject';
import { Types } from 'mongoose';

export class StudentService {
  async getProfile(userId: string) {
    const student = await Student.findOne({ userId: new Types.ObjectId(userId) }).populate('userId', 'name email role status');
    return student;
  }

  async getAttendanceSummary(studentId: string, subjectId?: string) {
    const query: any = { studentId: new Types.ObjectId(studentId) };
    if (subjectId) {
      query.subjectId = new Types.ObjectId(subjectId);
    }
    const records = await Attendance.find(query).populate('subjectId', 'name code').populate('sessionId').sort({ date: -1 });
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const attendancePercentage = total ? Math.round(((present + late) / total) * 100) : 100;

    // Group by subject
    const subjectMap: Record<string, { subject: any; total: number; attended: number }> = {};
    records.forEach((r: any) => {
      const sId = r.subjectId?._id?.toString() || 'unknown';
      if (!subjectMap[sId]) {
        subjectMap[sId] = {
          subject: r.subjectId,
          total: 0,
          attended: 0,
        };
      }
      subjectMap[sId].total += 1;
      if (r.status === 'present' || r.status === 'late') {
        subjectMap[sId].attended += 1;
      }
    });

    const subjectBreakdown = Object.values(subjectMap).map((item) => ({
      subject: item.subject,
      total: item.total,
      attended: item.attended,
      percentage: item.total ? Math.round((item.attended / item.total) * 100) : 100,
    }));

    return {
      total,
      present,
      late,
      absent,
      attendancePercentage,
      subjectBreakdown,
      records,
    };
  }

  async getExamResults(studentId: string) {
    return await ExamResult.find({ studentId: new Types.ObjectId(studentId) })
      .populate({
        path: 'examId',
        populate: { path: 'subjectId', select: 'name code' },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getTodayClasses(studentId: string) {
    const student = await Student.findById(studentId);
    if (!student) return [];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    const schedules = await ClassSchedule.find({
      section: student.section,
      day: currentDay,
    })
      .populate('subjectId', 'name code department')
      .populate('teacherId', 'name employeeId')
      .populate('classroomId', 'roomNumber block floor capacity')
      .sort({ startTime: 1 })
      .lean();

    return schedules;
  }

  async getTimetable(studentId: string) {
    const student = await Student.findById(studentId);
    if (!student) return [];

    const schedules = await ClassSchedule.find({
      section: student.section,
    })
      .populate('subjectId', 'name code department')
      .populate('teacherId', 'name employeeId')
      .populate('classroomId', 'roomNumber block floor')
      .sort({ day: 1, startTime: 1 })
      .lean();

    return schedules;
  }

  async getDailySeat(studentId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const allocation = await DailySeatAllocation.findOne({
      studentId: new Types.ObjectId(studentId),
      date: { $gte: start, $lte: end },
    })
      .populate('classroomId', 'roomNumber block floor')
      .populate('seatId', 'row column seatNumber isPermanent')
      .lean();

    return allocation;
  }
}

export default new StudentService();
