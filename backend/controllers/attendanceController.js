//backend/controllers/attendanceController.js

import QRSession from '../models/QRSession.js';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

//crypto is a built-in Node.js module used to generate secure, unpredictable random values.
//It comes pre-installed with Node.js

/*What crypto.randomBytes(32) actually does

 randomBytes
 Generates true cryptographic random data
 Not predictable
 Safe for security usage

 (32)
 Means 32 bytes
 1 byte = 8 bits
 32 bytes = 256 bits
 256-bit randomness = extremely secure
*/

/* Why you needed crypto in your QR system

Your code:

import crypto from 'crypto';

const qrCode = crypto.randomBytes(32).toString('hex');

This line is used to create a secure QR value.
*/

// attendanceController.js – Attendance & QR system
//Generate QR codes
//Validate QR session
//Mark attendance
//Prevent duplicate attendance
//Role-based attendance history

//“By using short-lived QR codes, authenticated users, enrollment validation, and a per-day attendance check at the database level.”
//“Attendance can only be marked by a logged-in user with a valid JWT token.”

/*Main Purpose

 Securely records student attendance using QR codes

Key Functions
 Generate time-bound QR codes (faculty only)
 Validate QR sessions and expiry
 Ensure student authentication
 Prevent duplicate attendance
 Verify student enrollment
 Provide role-based attendance history

One-line interview summary
 “attendanceController implements a secure, QR-based attendance system with anti-proxy and anti-duplicate checks.”
*/

export const generateQR = async (req, res) => {
  try {
    const { classId } = req.body;  //Extracts the class ID from the request sent by frontend.

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    // Faculty-only QR generation
    if (classDoc.faculty.toString() !== req.user._id.toString()) //Only the faculty assigned to this class can generate QR codes.
      return res.status(403).json({ message: 'Not authorized' });

    // 🔥 NEW: Invalidate all previous active QR sessions for this class
    await QRSession.updateMany(
      { class: classId, isActive: true },
      { isActive: false }
    );

    // 🔥 NEW: Define fixed 15-minute attendance window
    const sessionStart = new Date();
    const sessionEndsAt = new Date(sessionStart.getTime() + 15 * 60 * 1000); // 15 minutes

    // Secure QR value
    const qrCode = crypto.randomBytes(32).toString('hex');

    const validFrom = new Date();

    // 🔥 UPDATED: QR valid for only 10 seconds
    const validUntil = new Date(validFrom.getTime() + 10 * 1000);

    const qrSession = await QRSession.create({  /* Stores QR metadata in DB:

                                                Which class

                                                Who created it 

                                                Validity window

                                                  This record is later used to validate attendance.*/
                                                   
      class: classId,
      qrCode,
      createdBy: req.user._id,

      // 🔥 ADDED: fixed session window
      sessionStart,
      sessionEndsAt,

      validFrom,
      validUntil,
      isActive: true
    });

    const qrImage = await QRCode.toDataURL(
      JSON.stringify({
        sessionId: qrSession._id,
        qrCode,
        classId
      })
    );

    res.json({
      sessionId: qrSession._id,
      qrImage,
      validUntil,
      sessionEndsAt, // 🔥 frontend uses this to stop QR refresh
      expirySeconds: 10
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { sessionId, qrCode } = req.body;
    const qrSession = await QRSession.findById(sessionId).populate('class');

    // 🔐 QR must exist and be active
    if (!qrSession || !qrSession.isActive)
      return res.status(400).json({ message: 'QR is invalid or expired' });

    const now = new Date();

    // 🔥 NEW: Check fixed 15-minute attendance window
    if (now < qrSession.sessionStart || now > qrSession.sessionEndsAt) {
      qrSession.isActive = false;
      await qrSession.save();
      return res.status(400).json({ message: 'Attendance session expired' });
    }

    // QR value must match
    if (qrSession.qrCode !== qrCode)
      return res.status(400).json({ message: 'Invalid QR code' });

    // 🔥 Strict 10-second QR validation
    if (now < qrSession.validFrom || now > qrSession.validUntil) {
      return res.status(400).json({ message: 'QR expired, please scan new QR' });
    }

    const classDoc = await Class.findById(qrSession.class._id);

    // Student must be enrolled
    if (!classDoc.students.includes(req.user._id))
      return res.status(403).json({ message: 'Not enrolled in this class' });

    // Prevent duplicate attendance (per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      class: qrSession.class._id,
      student: req.user._id,
      date: { $gte: today }
    });

    if (existingAttendance)
      return res.status(400).json({ message: 'Attendance already marked for today' });

    const attendance = await Attendance.create({
      class: qrSession.class._id,
      student: req.user._id,
      date: new Date(),
      status: 'present',
      markedBy: 'qr'
    });

    qrSession.attendees.push({
      student: req.user._id,
      markedAt: new Date()
    });

    await qrSession.save();

    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fixed: use query param instead of optional route param
export const getAttendanceHistory = async (req, res) => {
  try {
    const classId = req.query.classId;
    let query = {};

    if (req.user.role === 'student') {
      query = { student: req.user._id };
      if (classId) query.class = classId;
    } else if (req.user.role === 'faculty') {
      if (!classId)
        return res.status(400).json({ message: 'classId is required for faculty' });

      const classDoc = await Class.findById(classId);
      if (!classDoc || classDoc.faculty.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized' });

      query.class = classId;
    } else if (classId) {
      query.class = classId;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId')
      .populate('class', 'name code')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
