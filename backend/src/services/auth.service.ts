import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export const authService = {
  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // If student, check roll number uniqueness
    if (input.role === 'student' && input.rollNumber) {
      const existingRoll = await User.findOne({ rollNumber: input.rollNumber });
      if (existingRoll) {
        throw new AppError('Roll number already registered', 409);
      }
    }

    // Create user - password will be hashed by pre-save hook
    const user = new User({
      name: input.name,
      email: input.email,
      passwordHash: input.password, // Will be hashed in pre-save hook
      role: input.role,
      rollNumber: input.rollNumber,
    });

    await user.save();

    // Generate token
    const token = this.generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
      },
      token,
    };
  },

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).select('+passwordHash');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(input.password);

    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
      },
      token,
    };
  },

  generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  },
};
