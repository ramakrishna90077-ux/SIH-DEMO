import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { AppError } from '../middleware/error.middleware.js';

export const authController = {
  async register(req: AuthRequest, res: Response) {
    const validatedData = registerSchema.parse(req.body);
    if (validatedData.role === 'teacher' && process.env.ALLOW_PUBLIC_TEACHER_SIGNUP !== 'true') {
      throw new AppError('Teacher accounts must be provisioned by an administrator', 403);
    }
    const result = await authService.register(validatedData);
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  },

  async login(req: AuthRequest, res: Response) {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  },

  async logout(_req: AuthRequest, res: Response) {
    res.status(204).send();
  },

  async getMe(req: AuthRequest, res: Response) {
    res.status(200).json({ success: true, data: {
      user: { id: req.user?._id, name: req.user?.name, email: req.user?.email, role: req.user?.role, rollNumber: req.user?.rollNumber },
    }});
  },
};
