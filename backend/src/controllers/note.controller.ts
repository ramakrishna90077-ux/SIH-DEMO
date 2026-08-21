import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { noteService } from '../services/note.service.js';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js';
import { AppError } from '../middleware/error.middleware.js';

const id = (value: string | string[] | undefined) => {
  if (!value || Array.isArray(value)) throw new AppError('Invalid resource ID', 400);
  return value;
};

export const noteController = {
  async list(req: AuthRequest, res: Response) {
    const userId = req.user!._id.toString();
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const topic = typeof req.query.topic === 'string' ? req.query.topic : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const data = req.user!.role === 'teacher'
      ? await noteService.getNotes(courseId, search, topic, undefined, page, limit)
      : { notes: await noteService.getNotesByStudent(userId, courseId), pagination: undefined };
    res.json({ success: true, data });
  },

  async get(req: AuthRequest, res: Response) {
    const note = await noteService.getNoteById(id(req.params.id), req.user!._id.toString(), req.user!.role);
    res.json({ success: true, data: note });
  },

  async create(req: AuthRequest, res: Response) {
    const data = createNoteSchema.parse(req.body);
    const note = await noteService.createNote(req.user!._id.toString(), data.courseId, data.title, data.description, data.topic, data.tags, data.fileUrl);
    res.status(201).json({ success: true, data: note });
  },

  async update(req: AuthRequest, res: Response) {
    const data = updateNoteSchema.parse(req.body);
    const note = await noteService.updateNote(id(req.params.id), req.user!._id.toString(), data);
    res.json({ success: true, data: note });
  },

  async remove(req: AuthRequest, res: Response) {
    await noteService.deleteNote(id(req.params.id), req.user!._id.toString());
    res.status(204).send();
  },
};
