import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error: any) {
      // Errors are handled by the error middleware
      throw error;
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      throw error;
    }
  },

  async getMe(req: AuthRequest, res: Response) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user?._id,
            name: req.user?.name,
            email: req.user?.email,
            role: req.user?.role,
            rollNumber: req.user?.rollNumber,
          },
        },
      });
    } catch (error: any) {
      throw error;
    }
  },
};
