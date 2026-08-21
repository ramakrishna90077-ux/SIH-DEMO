import { AttendanceSession } from '../models/AttendanceSession.js';
import { Attendance } from '../models/Attendance.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { attendanceService } from '../services/attendance.service.js';
import mongoose from 'mongoose';

const assertId = (value: string) => {
  if (!mongoose.isValidObjectId(value)) throw new AppError('Invalid resource ID', 400);
};

export const attendanceServiceLayer = {
  async startSession(teacherId: string, courseId: string, durationMinutes: number) {
    assertId(courseId);
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    const existing = await AttendanceSession.findOne({ courseId, status: 'active', expiresAt: { $gt: new Date() } });
    if (existing) throw new AppError('An active attendance session already exists for this course', 409);
    const code = attendanceService.generateCode();
    const expiresAt = attendanceService.calculateExpiresAt(durationMinutes);
    const session = await AttendanceSession.create({ courseId, teacherId, code, expiresAt, status: 'active' });
    return { session, code, totalStudents: course.students.length };
  },

  async markAttendance(studentId: string, sessionId: string, code: string) {
    assertId(sessionId);
    const session = await AttendanceSession.findById(sessionId);
    if (!session) throw new AppError('Attendance session not found', 404);
    if (!attendanceService.isSessionActive(session)) throw new AppError(session.status === 'closed' ? 'Attendance session has been closed by the teacher' : 'Attendance session has expired', 400);
    if (session.code !== code.trim().toUpperCase()) throw new AppError('Invalid attendance code', 400);
    const course = await Course.findById(session.courseId);
    if (!course) throw new AppError('Course not found', 404);
    if (!course.students.some((s) => s.toString() === studentId)) throw new AppError('You are not enrolled in this course', 403);
    const student = await User.findById(studentId).select('role');
    if (!student || student.role !== 'student') throw new AppError('Only students can mark attendance', 403);
    try { return await Attendance.create({ sessionId, courseId: session.courseId, studentId }); }
    catch (error: any) { if (error.code === 11000) throw new AppError('You have already marked attendance for this session', 409); throw error; }
  },

  async closeSession(teacherId: string, sessionId: string) {
    assertId(sessionId);
    const session = await AttendanceSession.findOne({ _id: sessionId, teacherId });
    if (!session) throw new AppError('Session not found or unauthorized', 404);
    session.status = 'closed'; await session.save(); return session;
  },

  async getSessionStats(sessionId: string, userId: string, role: string) {
    assertId(sessionId);
    const session = await AttendanceSession.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404);
    const course = await Course.findById(session.courseId).select('name code teacherId students');
    if (!course) throw new AppError('Course not found', 404);
    if (role === 'teacher' && course.teacherId.toString() !== userId) throw new AppError('Unauthorized to view this session', 403);
    if (role === 'student' && !course.students.some((s) => s.toString() === userId)) throw new AppError('Not enrolled in this course', 403);
    const attendanceRecords = await Attendance.find({ sessionId }).populate('studentId', 'name email rollNumber');
    const totalStudents = course.students.length;
    return { session: { ...session.toObject(), code: role === 'teacher' ? session.code : undefined }, presentCount: attendanceRecords.length, totalStudents, absentCount: Math.max(0, totalStudents - attendanceRecords.length), percentage: totalStudents ? ((attendanceRecords.length / totalStudents) * 100).toFixed(2) : '0', attendedStudents: attendanceRecords };
  },

  async getCourseSessions(courseId: string, userId: string, role: string) {
    assertId(courseId);
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);
    if (role === 'teacher' && course.teacherId.toString() !== userId) throw new AppError('Unauthorized', 403);
    if (role === 'student' && !course.students.some((s) => s.toString() === userId)) throw new AppError('Not enrolled in this course', 403);
    return AttendanceSession.find({ courseId }).sort({ createdAt: -1 }).select('-code');
  },

  async getStudentAttendance(studentId: string, courseId?: string) {
    const query: any = { studentId };
    if (courseId) { assertId(courseId); query.courseId = courseId; }
    return Attendance.find(query).populate({ path: 'sessionId', select: 'courseId startedAt expiresAt status', populate: { path: 'courseId', select: 'name code' } }).sort({ markedAt: -1 });
  },

  async getStudentAnalytics(studentId: string) {
    const courses = await Course.find({ students: studentId }).select('_id name code');
    const courseIds = courses.map((course) => course._id);
    const [sessions, records] = await Promise.all([
      AttendanceSession.find({ courseId: { $in: courseIds } }).select('_id courseId'),
      Attendance.find({ studentId, courseId: { $in: courseIds } }).select('sessionId courseId'),
    ]);
    const attended = new Set(records.map((record) => record.sessionId.toString()));
    const totalSessions = sessions.length;
    return { totalSessions, attended: records.length, percentage: totalSessions ? Number(((records.length / totalSessions) * 100).toFixed(2)) : 0,
      courses: courses.map((course) => { const courseSessions = sessions.filter((s) => s.courseId.toString() === course._id.toString()); const present = courseSessions.filter((s) => attended.has(s._id.toString())).length; return { courseId: course._id, name: course.name, code: course.code, totalSessions: courseSessions.length, attended: present, percentage: courseSessions.length ? Number(((present / courseSessions.length) * 100).toFixed(2)) : 0 }; }),
    };
  },

  async getCourseAnalytics(courseId: string, teacherId: string) {
    assertId(courseId);
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) throw new AppError('Course not found or unauthorized', 404);
    const [sessions, attendanceRecords, students] = await Promise.all([
      AttendanceSession.find({ courseId }).select('_id'),
      Attendance.find({ courseId }).select('studentId'),
      User.find({ _id: { $in: course.students } }).select('name email rollNumber'),
    ]);
    return students.map((student) => { const present = attendanceRecords.filter((record) => record.studentId.toString() === student._id.toString()).length; const total = sessions.length; return { id: student._id, name: student.name, email: student.email, rollNumber: student.rollNumber, present, total, percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0 }; });
  },

  async getActiveSession(courseId: string) {
    assertId(courseId);
    return AttendanceSession.findOne({ courseId, status: 'active', expiresAt: { $gt: new Date() } }).select('-code');
  },
};
