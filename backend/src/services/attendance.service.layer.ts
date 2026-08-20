import { AttendanceSession } from '../models/AttendanceSession.js';
import { Attendance } from '../models/Attendance.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { attendanceService } from '../services/attendance.service.js';
import mongoose from 'mongoose';

export const attendanceServiceLayer = {
  /**
   * Start a new attendance session for a course
   */
  async startSession(teacherId: string, courseId: string, durationMinutes: number) {
    // Verify teacher owns the course
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      throw new AppError('Course not found or unauthorized', 404);
    }

    // Check if there's already an active session for this course
    const existingActiveSession = await AttendanceSession.findOne({
      courseId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (existingActiveSession) {
      throw new AppError('An active attendance session already exists for this course', 409);
    }

    // Generate secure attendance code
    const code = attendanceService.generateCode();
    const expiresAt = attendanceService.calculateExpiresAt(durationMinutes);

    const session = new AttendanceSession({
      courseId,
      teacherId,
      code,
      expiresAt,
      status: 'active',
    });

    await session.save();

    return {
      session,
      code,
      totalStudents: course.students.length,
    };
  },

  /**
   * Mark attendance using a session code
   * This is the critical function that prevents duplicate attendance
   */
  async markAttendance(studentId: string, sessionId: string, code: string) {
    // Find the session
    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      throw new AppError('Attendance session not found', 404);
    }

    // Check if session is active
    if (!attendanceService.isSessionActive(session)) {
      if (session.status === 'closed') {
        throw new AppError('Attendance session has been closed by the teacher', 400);
      }
      if (new Date() >= session.expiresAt) {
        throw new AppError('Attendance session has expired', 400);
      }
      throw new AppError('Attendance session is not active', 400);
    }

    // Verify the code matches
    if (session.code !== code.toUpperCase()) {
      throw new AppError('Invalid attendance code', 400);
    }

    // Verify student is enrolled in the course
    const course = await Course.findById(session.courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const isEnrolled = course.students.some((s) => s.toString() === studentId);
    if (!isEnrolled) {
      throw new AppError('You are not enrolled in this course', 403);
    }

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      throw new AppError('Only students can mark attendance', 403);
    }

    // CRITICAL: Attempt to create attendance record
    // The unique compound index (sessionId + studentId) will prevent duplicates
    try {
      const attendance = new Attendance({
        sessionId,
        courseId: session.courseId,
        studentId,
      });

      await attendance.save();

      return attendance;
    } catch (error: any) {
      // Handle duplicate key error - student already marked attendance
      if (error.code === 11000) {
        throw new AppError('You have already marked attendance for this session', 409);
      }
      throw error;
    }
  },

  /**
   * Close an attendance session
   */
  async closeSession(teacherId: string, sessionId: string) {
    const session = await AttendanceSession.findOne({ _id: sessionId, teacherId });
    if (!session) {
      throw new AppError('Session not found or unauthorized', 404);
    }

    session.status = 'closed';
    await session.save();

    return session;
  },

  /**
   * Get session details with attendance stats
   */
  async getSessionStats(sessionId: string, userId: string, role: string) {
    const session = await AttendanceSession.findById(sessionId)
      .populate('courseId', 'name code')
      .populate('teacherId', 'name email');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Authorization check
    if (role === 'teacher' && session.teacherId.toString() !== userId) {
      throw new AppError('Unauthorized to view this session', 403);
    }

    // Get attendance count
    const attendanceCount = await Attendance.countDocuments({ sessionId });

    // Get course info for total students
    const course = await Course.findById(session.courseId);
    const totalStudents = course?.students.length || 0;

    // Get students who have marked attendance
    const attendanceRecords = await Attendance.find({ sessionId }).populate('studentId', 'name email rollNumber');

    return {
      session,
      presentCount: attendanceCount,
      totalStudents,
      absentCount: totalStudents - attendanceCount,
      percentage: totalStudents > 0 ? ((attendanceCount / totalStudents) * 100).toFixed(2) : '0',
      attendedStudents: attendanceRecords,
    };
  },

  /**
   * Get all sessions for a course
   */
  async getCourseSessions(courseId: string, userId: string, role: string) {
    // Verify access
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (role === 'teacher' && course.teacherId.toString() !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (role === 'student' && !course.students.some((s) => s.toString() === userId)) {
      throw new AppError('Not enrolled in this course', 403);
    }

    const sessions = await AttendanceSession.find({ courseId })
      .sort({ createdAt: -1 })
      .select('-code'); // Don't expose old codes

    return sessions;
  },

  /**
   * Get student's attendance history
   */
  async getStudentAttendance(studentId: string, courseId?: string) {
    const query: any = { studentId };
    if (courseId) {
      query.courseId = courseId;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'sessionId',
        select: 'courseId startedAt expiresAt status',
        populate: { path: 'courseId', select: 'name code' },
      })
      .sort({ markedAt: -1 });

    return attendanceRecords;
  },

  /**
   * Get attendance analytics for a course
   */
  async getCourseAnalytics(courseId: string, teacherId: string) {
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      throw new AppError('Course not found or unauthorized', 404);
    }

    // Get all sessions for this course
    const sessions = await AttendanceSession.find({ courseId });
    const sessionIds = sessions.map((s) => s._id);

    // Get all attendance records
    const attendanceRecords = await Attendance.find({ courseId });

    // Calculate per-student attendance
    const studentAttendance = new Map<string, { present: number; total: number }>();

    // Initialize all students
    course.students.forEach((studentId) => {
      studentAttendance.set(studentId.toString(), { present: 0, total: sessions.length });
    });

    // Count attendance per student
    attendanceRecords.forEach((record) => {
      const studentIdStr = record.studentId.toString();
      const data = studentAttendance.get(studentIdStr);
      if (data) {
        data.present++;
      }
    });

    // Build result
    const students = await User.find({ _id: { $in: course.students } }).select('name email rollNumber');

    const studentStats = students.map((student) => {
      const stats = studentAttendance.get(student._id.toString()) || { present: 0, total: 0 };
      const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : '0';
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        present: stats.present,
        total: stats.total,
        percentage,
      };
    });

    return {
      course,
      totalSessions: sessions.length,
      studentStats,
    };
  },

  /**
   * Get active session for a course (for teacher dashboard)
   */
  async getActiveSession(courseId: string) {
    const session = await AttendanceSession.findOne({
      courseId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return null;
    }

    const attendanceCount = await Attendance.countDocuments({ sessionId: session._id });
    const course = await Course.findById(courseId);

    return {
      session,
      code: session.code,
      presentCount: attendanceCount,
      totalStudents: course?.students.length || 0,
    };
  },
};
