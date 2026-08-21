import { Note } from '../models/Note.js';
import { Course } from '../models/Course.js';
import { AppError } from '../middleware/error.middleware.js';
import { INote } from '../models/Note.js';
import mongoose from 'mongoose';

const assertId = (value: string) => {
  if (!mongoose.isValidObjectId(value)) throw new AppError('Invalid resource ID', 400);
};

export const noteService = {
  async createNote(teacherId: string, courseId: string, title: string, description?: string, topic?: string, tags?: string[], fileUrl?: string) {
    assertId(courseId);
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    const note = new Note({ courseId, teacherId, title, description, topic, tags, fileUrl });
    await note.save();
    return note;
  },

  async getNotes(teacherId: string, courseId?: string, search?: string, topic?: string, tag?: string, page = 1, limit = 10) {
    const teacherCourses = await Course.find({ teacherId }).select('_id');
    const courseIds = teacherCourses.map((course) => course._id);
    const query: any = { courseId: { $in: courseIds } };

    if (courseId) {
      assertId(courseId);
      if (!courseIds.some((id) => id.toString() === courseId)) {
        throw new AppError('Course not found or unauthorized', 404);
      }
      query.courseId = courseId;
    }
    if (search) query.$text = { $search: search };
    if (topic) query.topic = new RegExp(topic, 'i');
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const [notes, total] = await Promise.all([
      Note.find(query).populate('courseId', 'name code').populate('teacherId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Note.countDocuments(query),
    ]);
    return { notes, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalNotes: total, hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  },

  async getNoteById(noteId: string, userId: string, role: 'student' | 'teacher') {
    assertId(noteId);
    const note = await Note.findById(noteId).populate('courseId', 'name code teacherId students').populate('teacherId', 'name email');
    if (!note) throw new AppError('Note not found', 404);
    const course = note.courseId as any;
    const authorized = role === 'teacher'
      ? course?.teacherId?.toString() === userId
      : Array.isArray(course?.students) && course.students.some((student: unknown) => String(student) === userId);
    if (!authorized) throw new AppError('Note not found or unauthorized', 404);
    return note;
  },

  async updateNote(noteId: string, teacherId: string, updates: Partial<INote>) {
    assertId(noteId);
    const note = await Note.findOne({ _id: noteId, teacherId });
    if (!note) throw new AppError('Note not found or unauthorized', 404);
    Object.assign(note, updates);
    await note.save();
    return note;
  },

  async deleteNote(noteId: string, teacherId: string) {
    assertId(noteId);
    const note = await Note.findOneAndDelete({ _id: noteId, teacherId });
    if (!note) throw new AppError('Note not found or unauthorized', 404);
    return note;
  },

  async getNotesByStudent(studentId: string, courseId?: string) {
    const courses = await Course.find({ students: studentId }).select('_id');
    const courseIds = courses.map((c) => c._id);
    const query: any = { courseId: { $in: courseIds } };
    if (courseId) {
      assertId(courseId);
      if (!courseIds.some((id) => id.toString() === courseId)) throw new AppError('Course not found or unauthorized', 404);
      query.courseId = courseId;
    }
    return Note.find(query).populate('courseId', 'name code').populate('teacherId', 'name email').sort({ createdAt: -1 });
  },
};
