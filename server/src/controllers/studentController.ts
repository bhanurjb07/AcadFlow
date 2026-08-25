import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import studentService from '../services/studentService';
import seatingService from '../services/seatingService';
import Student from '../models/Student';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const student = await studentService.getProfile(req.userId!);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, data: student });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttendanceSummary = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const summary = await studentService.getAttendanceSummary(student._id.toString(), req.query.subjectId as string);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExamResults = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const results = await studentService.getExamResults(student._id.toString());
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTodayClasses = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const classes = await studentService.getTodayClasses(student._id.toString());
    res.json({ success: true, data: classes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTimetable = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const timetable = await studentService.getTimetable(student._id.toString());
    res.json({ success: true, data: timetable });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDailySeat = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const allocation = await studentService.getDailySeat(student._id.toString(), req.query.date as string);
    res.json({ success: true, data: allocation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getClassroomSeating = async (req: AuthRequest, res: Response) => {
  try {
    const classroomId = String(req.params.classroomId);
    const date = req.query.date ? String(req.query.date) : undefined;
    const result = await seatingService.getClassroomGridWithAllocations(classroomId, date);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
