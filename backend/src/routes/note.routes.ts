import { Router } from 'express';
import { noteController } from '../controllers/note.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js';

const router = Router();
router.use(authenticate);
router.get('/', noteController.list);
router.get('/:id', noteController.get);
router.post('/', authorize('teacher'), validateRequest(createNoteSchema), noteController.create);
router.put('/:id', authorize('teacher'), validateRequest(updateNoteSchema), noteController.update);
router.delete('/:id', authorize('teacher'), noteController.remove);

export default router;
