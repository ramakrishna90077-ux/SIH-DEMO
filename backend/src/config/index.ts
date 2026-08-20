import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/student-attendance',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};
