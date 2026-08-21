import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import mongoose from 'mongoose';
import { ICourse } from '../models/Course.js';

const assertObjectId = (value: string) => {
  if (!mongoose.isValidObjectId(value)) throw new AppError('Invalid resource ID', 400);
};

export const courseService = {
  async createCourse(teacherId: string, name: string, code: string, description?: string) {
    const normalizedCode = code.trim().toUpperCase();
    if (await Course.exists({ code: normalizedCode })) throw new AppError('Course code already exists', 409);
    return Course.create({ name: name.trim(), code: normalizedCode, description: description?.trim(), teacherId });
  },

  async getCoursesByTeacher(teacherId: string) {
    return Course.find({ teacherId }).populate('students', 'name email rollNumber').sort({ createdAt: -1 });
  },

  async getCoursesByStudent(studentId: string) {
    return Course.find({ students: studentId }).populate('teacherId', 'name email').sort({ createdAt: -1 });
  },

  async getCourseById(courseId: string, userId: string, role: 'student' | 'teacher') {
    assertObjectId(courseId);
    const filter = role === 'teacher'
      ? { _id: courseId, teacherId: userId }
      : { _id: courseId, students: userId };
    const course = await Course.findOne(filter).populate('teacherId', 'name email').populate('students', 'name email rollNumber');
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    return course;
  },

  async getStudents(courseId: string, teacherId: string) {
    assertObjectId(courseId);
    const course = await Course.findOne({ _id: courseId, teacherId }).populate('students', 'name email rollNumber');
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    return course.students;
  },

  async updateCourse(courseId: string, teacherId: string, updates: Partial<ICourse>) {
    assertObjectId(courseId);
    if (updates.code) updates.code = updates.code.trim().toUpperCase();
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    if (updates.code && updates.code !== course.code && await Course.exists({ code: updates.code })) {
      throw new AppError('Course code already exists', 409);
    }
    Object.assign(course, updates);
    await course.save();
    return course;
  },

  async deleteCourse(courseId: string, teacherId: string) {
    assertObjectId(courseId);
    const course = await Course.findOneAndDelete({ _id: courseId, teacherId });
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    return course;
  },

  async joinCourse(studentId: string, courseCode: string) {
    const student = await User.findById(studentId).select('role');
    if (!student || student.role !== 'student') throw new AppError('Only students can join courses', 403);
    const course = await Course.findOne({ code: courseCode.trim().toUpperCase() });
    if (!course) throw new AppError('Course not found with this code', 404);
    if (course.students.some((s) => s.toString() === studentId)) throw new AppError('Already enrolled in this course', 409);
    course.students.push(studentId as any);
    await course.save();
    return course;
  },

  async removeStudent(courseId: string, teacherId: string, studentId: string) {
    assertObjectId(courseId);
    assertObjectId(studentId);
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    course.students = course.students.filter((s) => s.toString() !== studentId) as any[];
    await course.save();
    return course;
  },

  async getCourseStats(courseId: string) {
    assertObjectId(courseId);
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);
    return { totalStudents: course.students.length };
  },
};
