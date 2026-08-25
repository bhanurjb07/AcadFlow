import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import TeacherSubstitution from '../models/TeacherSubstitution';
import Teacher from '../models/Teacher';
import { Types } from 'mongoose';

export const getSubstitutions = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};
    if (req.userRole === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.userId });
      if (teacher) {
        query = {
          $or: [
            { substituteTeacherId: teacher._id },
            { absentTeacherId: teacher._id },
          ],
        };
      }
    }

    const substitutions = await TeacherSubstitution.find(query)
      .populate('absentTeacherId', 'name employeeId department')
      .populate('substituteTeacherId', 'name employeeId department')
      .populate('subjectId', 'name code')
      .populate({
        path: 'classScheduleId',
        populate: { path: 'classroomId', select: 'roomNumber block' },
      })
      .sort({ date: -1 });

    res.json({ success: true, data: substitutions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
