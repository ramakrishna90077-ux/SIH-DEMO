import { Router } from 'express';
import { courseController } from '../controllers/course.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createCourseSchema, joinCourseSchema } from '../validators/course.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teacher-only routes
router.post('/', authorize('teacher'), validateRequest(createCourseSchema), courseController.createCourse);
router.put('/:id', authorize('teacher'), courseController.updateCourse);
router.delete('/:id', authorize('teacher'), courseController.deleteCourse);
router.get('/my', authorize('teacher'), courseController.getMyCourses);
router.post('/:courseId/students/:studentId/remove', authorize('teacher'), courseController.removeStudent);

// Student routes
router.post('/join', authorize('student'), validateRequest(joinCourseSchema), courseController.joinCourse);
router.get('/my', authorize('student'), courseController.getMyCourses);

// Common routes
router.get('/:id', courseController.getCourseById);

export default router;
