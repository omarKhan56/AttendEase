//analyticsController.js

import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import User from '../models/User.js';




/* analyticsController.js — Attendance Analytics & Reporting
Main Purpose

 Converts attendance data into insights and reports

Key Functions

Calculate attendance percentages

Compute total sessions and absences

Detect low attendance students

Provide class-wise analytics

Provide student-wise analytics

Use MongoDB aggregation for trends

One-line interview summary

“analyticsController generates attendance statistics, trends, and performance insights.”*/


export const getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;
    const classDoc = await Class.findById(classId).populate('students');
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    const totalSessions = await Attendance.distinct('date', { class: classId }).then(dates => dates.length);
    const totalStudents = classDoc.students.length;

    const attendanceRecords = await Attendance.find({ class: classId }).populate('student', 'name studentId');

    const studentStats = {};
    classDoc.students.forEach(student => {
      studentStats[student._id] = { name: student.name, studentId: student.studentId, present: 0, absent: 0, percentage: 0 };
    });

    attendanceRecords.forEach(record => {
      if (studentStats[record.student._id]) {
        if (record.status === 'present' || record.status === 'late') studentStats[record.student._id].present++;
      }
    });

    Object.keys(studentStats).forEach(studentId => {
      studentStats[studentId].absent = totalSessions - studentStats[studentId].present;
      studentStats[studentId].percentage = totalSessions > 0
        ? ((studentStats[studentId].present / totalSessions) * 100).toFixed(2)
        : 0;
    });

    const dateWiseAttendance = await Attendance.aggregate([
      { $match: { class: classDoc._id } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      classInfo: { name: classDoc.name, code: classDoc.code, totalStudents, totalSessions },
      studentStats: Object.values(studentStats),
      dateWiseAttendance,
      lowAttendanceStudents: Object.values(studentStats).filter(s => parseFloat(s.percentage) < 75)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fixed: use query param instead of optional route param
export const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.user.role === 'student'
      ? req.user._id
      : req.query.studentId; // optional

    if (!studentId) return res.status(400).json({ message: 'studentId is required for non-students' });

    const student = await User.findById(studentId).populate('enrolledClasses');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const classStats = [];

    for (const classDoc of student.enrolledClasses) {
      const totalSessions = await Attendance.distinct('date', { class: classDoc._id }).then(dates => dates.length);
      const presentCount = await Attendance.countDocuments({
        class: classDoc._id,
        student: studentId,
        status: { $in: ['present', 'late'] }
      });

      classStats.push({
        className: classDoc.name,
        classCode: classDoc.code,
        totalSessions,
        present: presentCount,
        absent: totalSessions - presentCount,
        percentage: totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(2) : 0
      });
    }

    res.json({
      studentInfo: { name: student.name, studentId: student.studentId, department: student.department },
      classStats,
      overallPercentage: classStats.length > 0
        ? (classStats.reduce((sum, c) => sum + parseFloat(c.percentage), 0) / classStats.length).toFixed(2)
        : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
