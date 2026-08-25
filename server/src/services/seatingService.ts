import Classroom from '../models/Classroom';
import Seat from '../models/Seat';
import DailySeatAllocation from '../models/DailySeatAllocation';
import Student from '../models/Student';
import { Types } from 'mongoose';

export class SeatingService {
  async setupClassroomSeats(classroomId: string, rows: number, columns: number) {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    // Update classroom grid dimensions
    classroom.rows = rows;
    classroom.columns = columns;
    classroom.capacity = rows * columns;
    await classroom.save();

    // Remove existing seats if any
    await Seat.deleteMany({ classroomId: new Types.ObjectId(classroomId) });

    const newSeats = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= columns; c++) {
        newSeats.push({
          classroomId: classroom._id,
          row: r,
          column: c,
          seatNumber: `R${r}C${c}`,
          isPermanent: false,
        });
      }
    }

    const createdSeats = await Seat.insertMany(newSeats);
    return { classroom, seats: createdSeats };
  }

  async generateDailyAllocation(
    classroomId: string,
    section: string,
    allocationType: 'random' | 'permanent',
    adminId: string,
    targetDateStr?: string
  ) {
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    const seats = await Seat.find({ classroomId: new Types.ObjectId(classroomId) });
    if (seats.length === 0) throw new Error('No seats configured for this classroom');

    const students = await Student.find({ section });
    if (students.length === 0) throw new Error(`No students found for section ${section}`);

    if (students.length > seats.length) {
      throw new Error(`Insufficient seats. Classroom capacity is ${seats.length}, but section has ${students.length} students.`);
    }

    // Delete any existing allocations for this classroom on this day
    await DailySeatAllocation.deleteMany({
      classroomId: new Types.ObjectId(classroomId),
      date: { $gte: start, $lte: end },
    });

    let availableSeats = [...seats];
    let allocatedList = [];

    if (allocationType === 'permanent') {
      // Respect permanent seats where student has assigned seat
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const permSeat = availableSeats.find((s) => s.assignedStudentId && s.assignedStudentId.toString() === student._id.toString());
        const seat = permSeat || availableSeats[i];
        allocatedList.push({
          date: start,
          classroomId: classroom._id,
          studentId: student._id,
          seatId: seat._id,
          allocationType: 'permanent',
          createdBy: new Types.ObjectId(adminId),
        });
      }
    } else {
      // Random allocation: Fisher-Yates shuffle of available seats
      const shuffledSeats = [...availableSeats].sort(() => Math.random() - 0.5);
      for (let i = 0; i < students.length; i++) {
        allocatedList.push({
          date: start,
          classroomId: classroom._id,
          studentId: students[i]._id,
          seatId: shuffledSeats[i]._id,
          allocationType: 'random',
          createdBy: new Types.ObjectId(adminId),
        });
      }
    }

    const result = await DailySeatAllocation.insertMany(allocatedList);
    return await this.getClassroomGridWithAllocations(classroomId, start.toISOString());
  }

  async getClassroomGridWithAllocations(classroomId: string, dateStr?: string) {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const seats = await Seat.find({ classroomId: new Types.ObjectId(classroomId) }).lean();
    const allocations = await DailySeatAllocation.find({
      classroomId: new Types.ObjectId(classroomId),
      date: { $gte: start, $lte: end },
    })
      .populate('studentId', 'name rollNumber studentId profileImage section')
      .lean();

    const allocationMap = new Map();
    allocations.forEach((a: any) => {
      allocationMap.set(a.seatId.toString(), a.studentId);
    });

    const grid = seats.map((seat: any) => ({
      ...seat,
      allocatedStudent: allocationMap.get(seat._id.toString()) || null,
    }));

    return {
      classroom,
      date: start,
      seats: grid,
    };
  }

  async assignPermanentSeat(seatId: string, studentId: string) {
    const seat = await Seat.findByIdAndUpdate(
      seatId,
      {
        assignedStudentId: new Types.ObjectId(studentId),
        isPermanent: true,
      },
      { new: true }
    );
    return seat;
  }
}

export default new SeatingService();
