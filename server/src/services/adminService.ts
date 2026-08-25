import User from '../models/User';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Subject from '../models/Subject';
import Classroom from '../models/Classroom';
import ClassSchedule from '../models/ClassSchedule';
import Attendance from '../models/Attendance';
import TeacherSubstitution from '../models/TeacherSubstitution';
import Exam from '../models/Exam';
import ExamResult from '../models/ExamResult';
import AuditLog from '../models/AuditLog';
import { emitSubstitutionAssigned } from './socketService';
import { sendEmail } from './emailService';
import { Types } from 'mongoose';

export class AdminService {
  async getDashboardStats() {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClassrooms = await Classroom.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    const todayClassesCount = await ClassSchedule.countDocuments({ day: currentDay });

    const totalAttendance = await Attendance.countDocuments();
    const presentAttendance = await Attendance.countDocuments({ status: { $in: ['present', 'late'] } });
    const overallAttendanceRate = totalAttendance ? Math.round((presentAttendance / totalAttendance) * 100) : 85;

    // Recent substitutions
    const recentSubstitutions = await TeacherSubstitution.find()
      .populate('absentTeacherId', 'name employeeId department')
      .populate('substituteTeacherId', 'name employeeId department')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    // Audit logs
    const recentLogs = await AuditLog.find().populate('performedBy', 'name email role').sort({ createdAt: -1 }).limit(10);

    return {
      totalStudents,
      totalTeachers,
      totalClassrooms,
      totalSubjects,
      todayClassesCount,
      overallAttendanceRate,
      recentSubstitutions,
      recentLogs,
    };
  }

  // Teacher substitution ranking algorithm
  async findSubstituteCandidates(absentTeacherId: string, day: string, period: number, subjectId: string) {
    const absentTeacher = await Teacher.findById(absentTeacherId);
    if (!absentTeacher) throw new Error('Absent teacher not found');

    const targetSubject = await Subject.findById(subjectId);

    // Find all teachers except the absent one
    const teachers = await Teacher.find({ _id: { $ne: new Types.ObjectId(absentTeacherId) } });

    // Check who is busy during this day & period
    const busySchedules = await ClassSchedule.find({ day, period });
    const busyTeacherIds = new Set(busySchedules.map((s) => s.teacherId.toString()));

    const candidates = teachers.map((t) => {
      const isFree = !busyTeacherIds.has(t._id.toString());
      let score = 0;
      let reason = '';

      if (!isFree) {
        return {
          teacher: t,
          isFree: false,
          score: -1,
          recommendation: 'Busy during this period',
        };
      }

      // Priority 1: Teaches the exact subject (+50)
      if (t.subjects.includes(targetSubject?.code || '') || t.subjects.includes(targetSubject?.name || '')) {
        score += 50;
        reason = 'Subject Expert & Available';
      }
      // Priority 2: Same Department (+30)
      else if (t.department === absentTeacher.department) {
        score += 30;
        reason = 'Same Department Faculty';
      }
      // Priority 3: Any Available Teacher (+10)
      else {
        score += 10;
        reason = 'Available for Supervision';
      }

      return {
        teacher: t,
        isFree: true,
        score,
        recommendation: reason,
      };
    });

    // Sort by highest score first
    return candidates.sort((a, b) => b.score - a.score);
  }

  async assignSubstitute(data: {
    absentTeacherId: string;
    substituteTeacherId: string;
    classScheduleId: string;
    subjectId: string;
    date: string;
    reason?: string;
    adminId: string;
  }) {
    const targetDate = new Date(data.date);

    const substitution = await TeacherSubstitution.create({
      absentTeacherId: new Types.ObjectId(data.absentTeacherId),
      substituteTeacherId: new Types.ObjectId(data.substituteTeacherId),
      classScheduleId: new Types.ObjectId(data.classScheduleId),
      subjectId: new Types.ObjectId(data.subjectId),
      date: targetDate,
      reason: data.reason || 'Leave substitution',
      createdBy: new Types.ObjectId(data.adminId),
    });

    const populated = await TeacherSubstitution.findById(substitution._id)
      .populate('absentTeacherId')
      .populate('substituteTeacherId')
      .populate('subjectId')
      .populate('classScheduleId');

    // Notify substitute teacher
    emitSubstitutionAssigned(data.substituteTeacherId, populated);

    // Audit log
    await AuditLog.create({
      action: 'ASSIGN_SUBSTITUTE',
      performedBy: new Types.ObjectId(data.adminId),
      targetId: substitution._id.toString(),
      details: `Assigned substitute teacher for schedule ${data.classScheduleId}`,
    });

    return populated;
  }
}

export default new AdminService();
