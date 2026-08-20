import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  description?: string;
  teacherId: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient student lookup
courseSchema.index({ students: 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
