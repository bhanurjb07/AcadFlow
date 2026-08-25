import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import attendanceService from '../services/attendanceService';
import Teacher from '../models/Teacher';
import AttendanceSession from '../models/AttendanceSession';

export const startSession = async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId } = req.body;
    let teacherId = req.userId;
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (teacher) {
      teacherId = teacher._id.toString();
    }

    const session = await attendanceService.startSession(scheduleId, teacherId!);
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSessionDetails = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const details = await attendanceService.getSessionDetails(sessionId);
    res.json({ success: true, data: details });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, studentId, status } = req.body;
    const updated = await attendanceService.markAttendance(sessionId, studentId, status, req.userId!);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const batchMarkAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, records } = req.body;
    const result = await attendanceService.batchUpdateAttendance(sessionId, records, req.userId!);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const lockSession = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const session = await attendanceService.lockSession(sessionId, req.userId!);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateQRCodes = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const result = await attendanceService.generateQRCodes(sessionId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
