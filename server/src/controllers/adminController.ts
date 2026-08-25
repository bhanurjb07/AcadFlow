import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import adminService from '../services/adminService';
import seatingService from '../services/seatingService';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Classroom from '../models/Classroom';
import Subject from '../models/Subject';
import ClassSchedule from '../models/ClassSchedule';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Students CRUD ---
export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find().populate('userId', 'email name status').sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, studentId, rollNumber, department, semester, section, batch, subjects } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'Student123!', 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      status: 'active',
    });

    const student = await Student.create({
      userId: user._id,
      studentId,
      rollNumber,
      name,
      department,
      semester,
      section,
      batch,
      subjects: subjects || [],
    });

    res.status(201).json({ success: true, data: student });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Teachers CRUD ---
export const getTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const teachers = await Teacher.find().populate('userId', 'email name status').sort({ createdAt: -1 });
    res.json({ success: true, data: teachers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, employeeId, department, subjects, availability } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'Teacher123!', 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      status: 'active',
    });

    const teacher = await Teacher.create({
      userId: user._id,
      employeeId,
      name,
      department,
      subjects: subjects || [],
      availability: availability || [],
    });

    res.status(201).json({ success: true, data: teacher });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Classrooms CRUD ---
export const getClassrooms = async (req: AuthRequest, res: Response) => {
  try {
    const classrooms = await Classroom.find().sort({ roomNumber: 1 });
    res.json({ success: true, data: classrooms });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createClassroom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomNumber, block, floor, rows, columns } = req.body;
    const capacity = rows * columns;
    const classroom: any = await Classroom.create({
      roomNumber,
      block,
      floor,
      capacity,
      rows,
      columns,
    });

    // Auto-generate seat grid
    await seatingService.setupClassroomSeats(classroom._id.toString(), rows, columns);

    res.status(201).json({ success: true, data: classroom });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Subjects CRUD ---
export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSubject = async (req: AuthRequest, res: Response) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Class Schedules CRUD ---
export const getSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const schedules = await ClassSchedule.find()
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name employeeId')
      .populate('classroomId', 'roomNumber block')
      .sort({ day: 1, startTime: 1 });
    res.json({ success: true, data: schedules });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await ClassSchedule.create(req.body);
    const populated = await ClassSchedule.findById(schedule._id)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name employeeId')
      .populate('classroomId', 'roomNumber block');
    res.status(201).json({ success: true, data: populated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Seating Actions ---
export const generateSeating = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId, section, allocationType, date } = req.body;
    const result = await seatingService.generateDailyAllocation(
      classroomId,
      section,
      allocationType,
      req.userId!,
      date
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getClassroomSeatingGrid = async (req: AuthRequest, res: Response) => {
  try {
    const classroomId = String(req.params.classroomId);
    const date = req.query.date ? String(req.query.date) : undefined;
    const result = await seatingService.getClassroomGridWithAllocations(classroomId, date);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Substitution Actions ---
export const findSubstitutes = async (req: AuthRequest, res: Response) => {
  try {
    const { absentTeacherId, day, period, subjectId } = req.body;
    const candidates = await adminService.findSubstituteCandidates(
      absentTeacherId,
      day,
      Number(period),
      subjectId
    );
    res.json({ success: true, data: candidates });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignSubstitute = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await adminService.assignSubstitute({
      ...req.body,
      adminId: req.userId!,
    });
    res.json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
