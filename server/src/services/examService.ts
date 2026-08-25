import Exam from '../models/Exam';
import ExamResult from '../models/ExamResult';
import Student from '../models/Student';
import { Types } from 'mongoose';

export class ExamService {
  async createExam(data: {
    subjectId: string;
    classScheduleId: string;
    date: Date;
    maxMarks: number;
    durationMinutes: number;
    createdBy: string;
  }) {
    const exam = await Exam.create({
      subjectId: new Types.ObjectId(data.subjectId),
      classScheduleId: new Types.ObjectId(data.classScheduleId),
      date: data.date,
      maxMarks: data.maxMarks,
      durationMinutes: data.durationMinutes,
      createdBy: new Types.ObjectId(data.createdBy),
    });

    return await Exam.findById(exam._id)
      .populate('subjectId', 'name code')
      .populate('classScheduleId')
      .populate('createdBy', 'name email');
  }

  async getAllExams() {
    return await Exam.find()
      .populate('subjectId', 'name code')
      .populate('classScheduleId')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });
  }

  async recordMarks(
    examId: string,
    results: { studentId: string; marksObtained: number }[],
    evaluatedBy: string
  ) {
    const exam = await Exam.findById(examId);
    if (!exam) throw new Error('Exam not found');

    const ops = results.map((r) => {
      const percentage = (r.marksObtained / exam.maxMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      return ExamResult.findOneAndUpdate(
        {
          examId: new Types.ObjectId(examId),
          studentId: new Types.ObjectId(r.studentId),
        },
        {
          marksObtained: r.marksObtained,
          grade,
          evaluatedBy: new Types.ObjectId(evaluatedBy),
          evaluatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    });

    return await Promise.all(ops);
  }

  async getExamResults(examId: string) {
    return await ExamResult.find({ examId: new Types.ObjectId(examId) })
      .populate('studentId', 'name rollNumber studentId section')
      .sort({ marksObtained: -1 });
  }
}

export default new ExamService();
