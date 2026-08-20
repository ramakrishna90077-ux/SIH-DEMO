import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { startAttendanceSchema, markAttendanceSchema } from '../validators/attendance.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teacher-only routes
router.post('/sessions', authorize('teacher'), validateRequest(startAttendanceSchema), attendanceController.startSession);
router.post('/sessions/:sessionId/close', authorize('teacher'), attendanceController.closeSession);
router.get('/sessions/:sessionId/stats', authorize('teacher'), attendanceController.getSessionStats);
router.get('/course/:courseId/sessions', authorize('teacher'), attendanceController.getCourseSessions);
router.get('/course/:courseId/analytics', authorize('teacher'), attendanceController.getCourseAnalytics);
router.get('/course/:courseId/active', authorize('teacher'), attendanceController.getActiveSession);

// Student routes
router.post('/mark', authorize('student'), validateRequest(markAttendanceSchema), attendanceController.markAttendance);
router.get('/student/my', authorize('student'), attendanceController.getStudentAttendance);

export default router;
