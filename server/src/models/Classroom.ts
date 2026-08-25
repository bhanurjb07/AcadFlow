import mongoose, { Document, Schema } from 'mongoose';

export interface IClassroom extends Document {
  roomNumber: string;
  block?: string;
  floor?: string;
  capacity: number;
  rows: number;
  columns: number;
  status: string;
  createdAt: Date;
}

const ClassroomSchema = new Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    block: { type: String, default: 'Block A' },
    floor: { type: String, default: '1st Floor' },
    capacity: { type: Number, required: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    status: { type: String, default: 'active' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IClassroom>('Classroom', ClassroomSchema);
