import { Note } from '../models/Note.js';
import { Course } from '../models/Course.js';
import { AppError } from '../middleware/error.middleware.js';

export const noteService = {
  async createNote(
    teacherId: string,
    courseId: string,
    title: string,
    description?: string,
    topic?: string,
    tags?: string[],
    fileUrl?: string
  ) {
    // Verify teacher owns the course
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      throw new AppError('Course not found or unauthorized', 404);
    }

    const note = new Note({
      courseId,
      teacherId,
      title,
      description,
      topic,
      tags,
      fileUrl,
    });

    await note.save();
    return note;
  },

  async getNotes(courseId?: string, search?: string, topic?: string, tag?: string, page: number = 1, limit: number = 10) {
    const query: any = {};

    if (courseId) {
      query.courseId = courseId;
    }

    // Search functionality using text index
    if (search) {
      query.$text = { $search: search };
    }

    if (topic) {
      query.topic = new RegExp(topic, 'i');
    }

    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('courseId', 'name code')
        .populate('teacherId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(query),
    ]);

    return {
      notes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotes: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  },

  async getNoteById(noteId: string) {
    const note = await Note.findById(noteId)
      .populate('courseId', 'name code')
      .populate('teacherId', 'name email');

    if (!note) {
      throw new AppError('Note not found', 404);
    }

    return note;
  },

  async updateNote(noteId: string, teacherId: string, updates: Partial<Note>) {
    const note = await Note.findOne({ _id: noteId, teacherId });

    if (!note) {
      throw new AppError('Note not found or unauthorized', 404);
    }

    Object.assign(note, updates);
    await note.save();

    return note;
  },

  async deleteNote(noteId: string, teacherId: string) {
    const note = await Note.findOneAndDelete({ _id: noteId, teacherId });

    if (!note) {
      throw new AppError('Note not found or unauthorized', 404);
    }

    return note;
  },

  async getNotesByStudent(studentId: string, courseId?: string) {
    // Get courses the student is enrolled in
    const courses = await Course.find({ students: studentId }).select('_id');
    const courseIds = courses.map((c) => c._id);

    const query: any = { courseId: { $in: courseIds } };

    if (courseId) {
      query.courseId = courseId;
    }

    const notes = await Note.find(query)
      .populate('courseId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    return notes;
  },
};
