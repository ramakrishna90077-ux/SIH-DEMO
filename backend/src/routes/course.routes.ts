import { Router } from 'express';
import { courseController } from '../controllers/course.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createCourseSchema, joinCourseSchema } from '../validators/course.validator.js';

const router = Router();
router.use(authenticate);

router.get('/', courseController.getMyCourses);
router.get('/my', courseController.getMyCourses);
router.post('/', authorize('teacher'), validateRequest(createCourseSchema), courseController.createCourse);
router.post('/join', authorize('student'), validateRequest(joinCourseSchema), courseController.joinCourse);
router.get('/:id/students', authorize('teacher'), courseController.getStudents);
router.put('/:id', authorize('teacher'), courseController.updateCourse);
router.delete('/:id', authorize('teacher'), courseController.deleteCourse);
router.post('/:courseId/students/:studentId/remove', authorize('teacher'), courseController.removeStudent);
router.get('/:id', courseController.getCourseById);

export default router;
