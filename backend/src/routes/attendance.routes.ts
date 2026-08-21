import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { startAttendanceSchema, markAttendanceSchema } from '../validators/attendance.validator.js';

const router = Router();
router.use(authenticate);

router.post('/sessions', authorize('teacher'), validateRequest(startAttendanceSchema), attendanceController.startSession);
router.post('/sessions/:sessionId/close', authorize('teacher'), attendanceController.closeSession);
router.get('/sessions/:sessionId/stats', attendanceController.getSessionStats);
router.get('/course/:courseId/sessions', attendanceController.getCourseSessions);
router.get('/course/:courseId/analytics', authorize('teacher'), attendanceController.getCourseAnalytics);
router.get('/course/:courseId/active', attendanceController.getActiveSession);
router.post('/mark', authorize('student'), validateRequest(markAttendanceSchema), attendanceController.markAttendance);
router.get('/student/my', authorize('student'), attendanceController.getStudentAttendance);
router.get('/student/my/analytics', authorize('student'), attendanceController.getStudentAnalytics);

export default router;
