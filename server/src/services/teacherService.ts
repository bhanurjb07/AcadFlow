import Teacher from '../models/Teacher';
import ClassSchedule from '../models/ClassSchedule';
import AttendanceSession from '../models/AttendanceSession';
import TeacherSubstitution from '../models/TeacherSubstitution';
import Exam from '../models/Exam';
import { Types } from 'mongoose';

export class TeacherService {
  async getProfile(userId: string) {
    return await Teacher.findOne({ userId: new Types.ObjectId(userId) }).populate('userId', 'name email role status');
  }

  async getTodayClasses(teacherId: string) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    const directClasses = await ClassSchedule.find({
      teacherId: new Types.ObjectId(teacherId),
      day: currentDay,
    })
      .populate('subjectId', 'name code department')
      .populate('classroomId', 'roomNumber block floor capacity')
      .sort({ startTime: 1 })
      .lean();

    // Check if there are substitutions assigned to this teacher today
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const substitutions = await TeacherSubstitution.find({
      substituteTeacherId: new Types.ObjectId(teacherId),
      date: { $gte: start, $lte: end },
    })
      .populate('classScheduleId')
      .populate('subjectId', 'name code')
      .populate('absentTeacherId', 'name')
      .lean();

    return {
      regularClasses: directClasses,
      substitutionClasses: substitutions,
    };
  }

  async getDashboardData(teacherId: string) {
    const todayData = await this.getTodayClasses(teacherId);

    const upcomingExams = await Exam.find({
      createdBy: new Types.ObjectId(teacherId),
    })
      .populate('subjectId', 'name code')
      .populate('classScheduleId')
      .sort({ date: 1 })
      .limit(5)
      .lean();

    const recentSessions = await AttendanceSession.find({
      teacherId: new Types.ObjectId(teacherId),
    })
      .populate('subjectId', 'name code')
      .populate('classroomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      todayData,
      upcomingExams,
      recentSessions,
    };
  }

  async getAvailability(teacherId: string) {
    const teacher = await Teacher.findById(teacherId);
    return teacher ? teacher.availability : [];
  }

  async setAvailability(teacherId: string, availability: any[]) {
    return await Teacher.findByIdAndUpdate(
      teacherId,
      { availability },
      { new: true }
    );
  }
}

export default new TeacherService();
