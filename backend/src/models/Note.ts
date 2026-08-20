import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  courseId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  topic?: string;
  tags: string[];
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
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
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    topic: { type: String, trim: true, index: true },
    tags: [{ type: String, trim: true }],
    fileUrl: { type: String },
  },
  { timestamps: true }
);

// Text index for search functionality
noteSchema.index({ title: 'text', description: 'text', topic: 'text', tags: 'text' });

// Index for filtering by course and topic
noteSchema.index({ courseId: 1, topic: 1 });

// Index for filtering by tags
noteSchema.index({ tags: 1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
