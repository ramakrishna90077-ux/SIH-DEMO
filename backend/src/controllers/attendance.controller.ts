import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';
import { attendanceServiceLayer } from '../services/attendance.service.layer.js';
import { startAttendanceSchema, markAttendanceSchema } from '../validators/attendance.validator.js';
import { AppError } from '../middleware/error.middleware.js';

const param = (value: string | string[] | undefined) => {
  if (!value || Array.isArray(value)) throw new AppError('Invalid resource ID', 400);
  return value;
};

export const attendanceController = {
  async startSession(req: AuthRequest, res: Response) {
    const data = startAttendanceSchema.parse(req.body);
    const result = await attendanceServiceLayer.startSession(req.user!._id.toString(), data.courseId, data.durationMinutes);
    res.status(201).json({ success: true, message: 'Attendance session started', data: result });
  },
  async markAttendance(req: AuthRequest, res: Response) {
    const { sessionId, code } = markAttendanceSchema.parse(req.body);
    const attendance = await attendanceServiceLayer.markAttendance(req.user!._id.toString(), sessionId, code);
    res.json({ success: true, message: 'Attendance marked successfully', data: attendance });
  },
  async closeSession(req: AuthRequest, res: Response) {
    const session = await attendanceServiceLayer.closeSession(req.user!._id.toString(), param(req.params.sessionId));
    res.json({ success: true, data: session });
  },
  async getSessionStats(req: AuthRequest, res: Response) {
    const stats = await attendanceServiceLayer.getSessionStats(param(req.params.sessionId), req.user!._id.toString(), req.user!.role);
    res.json({ success: true, data: stats });
  },
  async getCourseSessions(req: AuthRequest, res: Response) {
    const sessions = await attendanceServiceLayer.getCourseSessions(param(req.params.courseId), req.user!._id.toString(), req.user!.role);
    res.json({ success: true, data: sessions });
  },
  async getStudentAttendance(req: AuthRequest, res: Response) {
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined;
    const records = await attendanceServiceLayer.getStudentAttendance(req.user!._id.toString(), courseId);
    res.json({ success: true, data: records });
  },
  async getStudentAnalytics(req: AuthRequest, res: Response) {
    const analytics = await attendanceServiceLayer.getStudentAnalytics(req.user!._id.toString());
    res.json({ success: true, data: analytics });
  },
  async getCourseAnalytics(req: AuthRequest, res: Response) {
    const analytics = await attendanceServiceLayer.getCourseAnalytics(param(req.params.courseId), req.user!._id.toString());
    res.json({ success: true, data: analytics });
  },
  async getActiveSession(req: AuthRequest, res: Response) {
    const activeSession = await attendanceServiceLayer.getActiveSession(param(req.params.courseId));
    res.json({ success: true, data: activeSession });
  },
};
