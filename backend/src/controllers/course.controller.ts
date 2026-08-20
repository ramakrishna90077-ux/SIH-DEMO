import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';
import { courseService } from '../services/course.service.js';
import { createCourseSchema, joinCourseSchema } from '../validators/course.validator.js';
import { Course } from '../models/Course.js';

export const courseController = {
  async createCourse(req: AuthRequest, res: Response) {
    try {
      const validatedData = createCourseSchema.parse(req.body);
      const teacherId = req.user!._id.toString();

      const course = await courseService.createCourse(
        teacherId,
        validatedData.name,
        validatedData.code,
        validatedData.description
      );

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getMyCourses(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const role = req.user!.role;

      let courses;
      if (role === 'teacher') {
        courses = await courseService.getCoursesByTeacher(userId);
      } else {
        courses = await courseService.getCoursesByStudent(userId);
      }

      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getCourseById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(id);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async updateCourse(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const teacherId = req.user!._id.toString();
      const { name, code, description } = req.body;

      const updates: Partial<Course> = {};
      if (name) updates.name = name;
      if (code) updates.code = code;
      if (description !== undefined) updates.description = description;

      const course = await courseService.updateCourse(id, teacherId, updates);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async deleteCourse(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const teacherId = req.user!._id.toString();

      await courseService.deleteCourse(id, teacherId);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error: any) {
      throw error;
    }
  },

  async joinCourse(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user!._id.toString();
      const { courseCode } = joinCourseSchema.parse(req.body);

      const course = await courseService.joinCourse(studentId, courseCode);

      res.status(200).json({
        success: true,
        message: 'Joined course successfully',
        data: course,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async removeStudent(req: AuthRequest, res: Response) {
    try {
      const { courseId, studentId } = req.params;
      const teacherId = req.user!._id.toString();

      const course = await courseService.removeStudent(courseId, teacherId, studentId);

      res.status(200).json({
        success: true,
        message: 'Student removed successfully',
        data: course,
