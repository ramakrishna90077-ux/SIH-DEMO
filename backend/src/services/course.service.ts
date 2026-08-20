import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import mongoose from 'mongoose';
import { ICourse } from '../models/Course.js';

export const courseService = {
  async createCourse(
    teacherId: string,
    name: string,
    code: string,
    description?: string
  ) {
    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      throw new AppError('Course code already exists', 409);
    }

    const course = new Course({
      name,
      code: code.toUpperCase(),
      description,
      teacherId,
    });

    await course.save();
    return course;
  },

  async getCoursesByTeacher(teacherId: string) {
    const courses = await Course.find({ teacherId }).populate('students', 'name email rollNumber');
    return courses;
  },

  async getCoursesByStudent(studentId: string) {
    const courses = await Course.find({ students: studentId }).populate('teacherId', 'name email');
    return courses;
  },

  async getCourseById(courseId: string) {
    const course = await Course.findById(courseId)
      .populate('teacherId', 'name email')
      .populate('students', 'name email rollNumber');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return course;
  },

  async updateCourse(courseId: string, teacherId: string, updates: Partial<ICourse>) {
    const course = await Course.findOne({ _id: courseId, teacherId });

    if (!course) {
      throw new AppError('Course not found or unauthorized', 404);
    }

    Object.assign(course, updates);
    await course.save();

    return course;
  },

  async deleteCourse(courseId: string, teacherId: string) {
    const course = await Course.findOneAndDelete({ _id: courseId, teacherId });

    if (!course) {
      throw new AppError('Course not found or unauthorized', 404);
    }

    return course;
  },

  async joinCourse(studentId: string, courseCode: string) {
    const course = await Course.findOne({ code: courseCode.toUpperCase() });

    if (!course) {
      throw new AppError('Course not found with this code', 404);
    }

    // Check if student is already enrolled
    if (course.students.some((s) => s.toString() === studentId)) {
      throw new AppError('Already enrolled in this course', 409);
    }

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      throw new AppError('Only students can join courses', 403);
    }

    course.students.push(studentId as any);
    await course.save();

    return course;
  },

  async removeStudent(courseId: string, teacherId: string, studentId: string) {
    const course = await Course.findOne({ _id: courseId, teacherId });

    if (!course) {
      throw new AppError('Course not found or unauthorized', 404);
    }

    course.students = course.students.filter((s) => s.toString() !== studentId) as any[];
    await course.save();

    return course;
  },

  async getCourseStats(courseId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return {
      totalStudents: course.students.length,
    };
  },
};
