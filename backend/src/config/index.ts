import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGODB_URI;

if (nodeEnv === 'production') {
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production');
  }
  if (!mongoUri) {
    throw new Error('MONGODB_URI must be set in production');
  }
}

export const config = {
  mongoUri: mongoUri || 'mongodb://127.0.0.1:27017/student-attendance',
  jwtSecret: jwtSecret || 'development-only-secret-change-me-please-32-chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv,
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}
