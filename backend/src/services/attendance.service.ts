import crypto from 'crypto';

export const attendanceService = {
  /**
   * Generate a secure, random attendance code
   */
  generateCode(): string {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars like I, O, 1, 0
    let code = '';
    const randomBytes = crypto.randomBytes(6);

    for (let i = 0; i < 6; i++) {
      code += chars[randomBytes[i] % chars.length];
    }

    return code;
  },

  /**
   * Calculate expiration time based on duration in minutes
   */
  calculateExpiresAt(durationMinutes: number): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);
    return expiresAt;
  },

  /**
   * Check if a session is still active
   */
  isSessionActive(session: {
    status: string;
    expiresAt: Date;
  }): boolean {
    return session.status === 'active' && new Date() < session.expiresAt;
  },
};
