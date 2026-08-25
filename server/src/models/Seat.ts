import mongoose, { Document, Schema } from 'mongoose';

export interface ISeat extends Document {
  classroomId: mongoose.Types.ObjectId;
  row: number;
  column: number;
  seatNumber: string;
  isPermanent?: boolean;
  assignedStudentId?: mongoose.Types.ObjectId;
  status: string;
  createdAt: Date;
}

const SeatSchema = new Schema(
  {
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    row: { type: Number, required: true },
    column: { type: Number, required: true },
    seatNumber: { type: String, required: true },
    isPermanent: { type: Boolean, default: false },
    assignedStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    status: { type: String, default: 'available' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ISeat>('Seat', SeatSchema);
