import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceSession extends Document {
  courseId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  code: string;
  startedAt: Date;
  expiresAt: Date;
  status: 'active' | 'closed' | 'expired';
  createdAt: Date;
}

const attendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'closed', 'expired'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

// Index for finding active sessions by course
attendanceSessionSchema.index({ courseId: 1, status: 1 });

// TTL index to auto-expire old sessions (optional cleanup)
attendanceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AttendanceSession = mongoose.model<IAttendanceSession>(
  'AttendanceSession',
  attendanceSessionSchema
);
