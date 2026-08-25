import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import teacherService from '../services/teacherService';
import Teacher from '../models/Teacher';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await teacherService.getProfile(req.userId!);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const data = await teacherService.getDashboardData(teacher._id.toString());
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTodayClasses = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const classes = await teacherService.getTodayClasses(teacher._id.toString());
    res.json({ success: true, data: classes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const availability = await teacherService.getAvailability(teacher._id.toString());
    res.json({ success: true, data: availability });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const setAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const updated = await teacherService.setAvailability(teacher._id.toString(), req.body.availability);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
