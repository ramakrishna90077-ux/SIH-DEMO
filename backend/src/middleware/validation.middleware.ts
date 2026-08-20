import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => e.message).join(', ');
        res.status(400).json({
          success: false,
          message: messages,
        });
        return;
      }
      next(error);
    }
  };
};
