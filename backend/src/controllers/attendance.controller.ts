import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';
import { attendanceServiceLayer } from '../services/attendance.service.layer.js';
import { startAttendanceSchema, markAttendanceSchema } from '../validators/attendance.validator.js';
import { AppError } from '../middleware/error.middleware.js';

export const attendanceController = {
  async startSession(req: AuthRequest, res: Response) {
    try {
      const validatedData = startAttendanceSchema.parse(req.body);
      const teacherId = req.user!._id.toString();

      const result = await attendanceServiceLayer.startSession(
        teacherId,
        validatedData.courseId,
        validatedData.durationMinutes
      );

      res.status(201).json({
        success: true,
        message: 'Attendance session started',
        data: result,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async markAttendance(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user!._id.toString();
      const { sessionId, code } = markAttendanceSchema.parse(req.body);

      const attendance = await attendanceServiceLayer.markAttendance(
        studentId,
        sessionId,
        code
      );

      res.status(200).json({
        success: true,
        message: 'Attendance marked successfully',
        data: attendance,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async closeSession(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!._id.toString();
      const { sessionId } = req.params;

      if (Array.isArray(sessionId)) {
        throw new AppError('Invalid session ID', 400);
      }

      const session = await attendanceServiceLayer.closeSession(teacherId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Attendance session closed',
        data: session,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getSessionStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const role = req.user!.role;
      const { sessionId } = req.params;

      if (Array.isArray(sessionId)) {
        throw new AppError('Invalid session ID', 400);
      }

      const stats = await attendanceServiceLayer.getSessionStats(sessionId, userId, role);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getCourseSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const role = req.user!.role;
      const { courseId } = req.params;

      if (Array.isArray(courseId)) {
        throw new AppError('Invalid course ID', 400);
      }

      const sessions = await attendanceServiceLayer.getCourseSessions(courseId, userId, role);

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getStudentAttendance(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user!._id.toString();
      const { courseId } = req.query;

      const records = await attendanceServiceLayer.getStudentAttendance(
        studentId,
        courseId as string | undefined
      );

      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getCourseAnalytics(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!._id.toString();
      const { courseId } = req.params;

      if (Array.isArray(courseId)) {
        throw new AppError('Invalid course ID', 400);
      }

      const analytics = await attendanceServiceLayer.getCourseAnalytics(courseId, teacherId);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getActiveSession(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;

      if (Array.isArray(courseId)) {
        throw new AppError('Invalid course ID', 400);
      }

      const activeSession = await attendanceServiceLayer.getActiveSession(courseId);

      res.status(200).json({
        success: true,
        data: activeSession,
      });
    } catch (error: any) {
      throw error;
    }
  },
};
