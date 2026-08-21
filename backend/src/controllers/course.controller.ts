import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';
import { courseService } from '../services/course.service.js';
import { createCourseSchema, joinCourseSchema } from '../validators/course.validator.js';
import { ICourse } from '../models/Course.js';
import { AppError } from '../middleware/error.middleware.js';

const param = (value: string | string[] | undefined) => {
  if (!value || Array.isArray(value)) throw new AppError('Invalid resource ID', 400);
  return value;
};

export const courseController = {
  async createCourse(req: AuthRequest, res: Response) {
    const data = createCourseSchema.parse(req.body);
    const course = await courseService.createCourse(req.user!._id.toString(), data.name, data.code, data.description);
    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  },

  async getMyCourses(req: AuthRequest, res: Response) {
    const userId = req.user!._id.toString();
    const courses = req.user!.role === 'teacher'
      ? await courseService.getCoursesByTeacher(userId)
      : await courseService.getCoursesByStudent(userId);
    res.json({ success: true, data: courses });
  },

  async getCourseById(req: AuthRequest, res: Response) {
    const course = await courseService.getCourseById(param(req.params.id), req.user!._id.toString(), req.user!.role);
    res.json({ success: true, data: course });
  },

  async getStudents(req: AuthRequest, res: Response) {
    const students = await courseService.getStudents(param(req.params.id), req.user!._id.toString());
    res.json({ success: true, data: students });
  },

  async updateCourse(req: AuthRequest, res: Response) {
    const id = param(req.params.id);
    const { name, code, description } = req.body;
    const updates: Partial<ICourse> = {};
    if (typeof name === 'string') updates.name = name.trim();
    if (typeof code === 'string') updates.code = code.trim();
    if (description !== undefined) updates.description = description;
    const course = await courseService.updateCourse(id, req.user!._id.toString(), updates);
    res.json({ success: true, data: course });
  },

  async deleteCourse(req: AuthRequest, res: Response) {
    await courseService.deleteCourse(param(req.params.id), req.user!._id.toString());
    res.status(204).send();
  },

  async joinCourse(req: AuthRequest, res: Response) {
    const { courseCode } = joinCourseSchema.parse(req.body);
    const course = await courseService.joinCourse(req.user!._id.toString(), courseCode);
    res.json({ success: true, message: 'Joined course successfully', data: course });
  },

  async removeStudent(req: AuthRequest, res: Response) {
    const course = await courseService.removeStudent(param(req.params.courseId), req.user!._id.toString(), param(req.params.studentId));
    res.json({ success: true, data: course });
  },
};
