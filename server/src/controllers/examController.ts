import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import examService from '../services/examService';

export const createExam = async (req: AuthRequest, res: Response) => {
  try {
    const exam = await examService.createExam({
      ...req.body,
      createdBy: req.userId!,
    });
    res.status(201).json({ success: true, data: exam });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllExams = async (req: AuthRequest, res: Response) => {
  try {
    const exams = await examService.getAllExams();
    res.json({ success: true, data: exams });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const recordMarks = async (req: AuthRequest, res: Response) => {
  try {
    const { examId, results } = req.body;
    const recorded = await examService.recordMarks(examId, results, req.userId!);
    res.json({ success: true, data: recorded });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExamResults = async (req: AuthRequest, res: Response) => {
  try {
    const examId = String(req.params.examId);
    const results = await examService.getExamResults(examId);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
