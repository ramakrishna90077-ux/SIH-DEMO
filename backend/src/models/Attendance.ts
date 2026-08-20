import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  sessionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  markedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// CRITICAL: Unique compound index to prevent duplicate attendance
// This ensures a student can only mark attendance once per session
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

// Index for querying by student and course
attendanceSchema.index({ studentId: 1, courseId: 1 });

// Index for querying attendance by session
attendanceSchema.index({ sessionId: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
