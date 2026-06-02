//backend/controllers/attendanceController.js
//backend/controllers/attendanceController.js

import QRSession from "../models/QRSession.js";
import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import QRCode from "qrcode";
import crypto from "crypto";
import redisClient from "../config/redis.js";

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

// Returns current IST date/time
const getISTDate = () => {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  );
};

// Converts HH:mm to minutes
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const generateQR = async (req, res) => {
  try {
    const { classId } = req.body;

    const classDoc = await Class.findById(classId);

    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    // Faculty-only QR generation
    if (classDoc.faculty.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // 🔥 NEW: Invalidate all previous active QR sessions for this class
    await QRSession.updateMany(
      { class: classId, isActive: true },
      { isActive: false },
    );

    // ================= REAL SCHEDULE VALIDATION =================

    const nowIST = getISTDate();

    const currentDay = nowIST.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const currentMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();

    const todaySchedule = classDoc.schedule?.find(
      (sch) => sch.day === currentDay,
    );

    if (!todaySchedule) {
      return res.status(400).json({
        message: "No class scheduled today",
      });
    }

    const startMinutes = timeToMinutes(todaySchedule.startTime);

    const endMinutes = timeToMinutes(todaySchedule.endTime);

    // Faculty can start attendance 5 mins before class
    const attendanceOpenMinutes = startMinutes - 5;

    if (currentMinutes < attendanceOpenMinutes || currentMinutes > endMinutes) {
      return res.status(400).json({
        message: `Attendance can only be started between ${
          todaySchedule.startTime
        } and ${todaySchedule.endTime}`,
      });
    }

    // Create real class start/end timestamps

    const sessionStart = new Date(nowIST);

    sessionStart.setHours(
      parseInt(todaySchedule.startTime.split(":")[0]),
      parseInt(todaySchedule.startTime.split(":")[1]),
      0,
      0,
    );

    const sessionEndsAt = new Date(nowIST);

    sessionEndsAt.setHours(
      parseInt(todaySchedule.endTime.split(":")[0]),
      parseInt(todaySchedule.endTime.split(":")[1]),
      0,
      0,
    );

    // ============================================================

    // Secure QR value
    const qrCode = crypto.randomBytes(32).toString("hex");

    const validFrom = new Date();

    // 🔥 UPDATED: QR valid for only 10 seconds
    const validUntil = new Date(validFrom.getTime() + 10 * 1000);

    const qrSession = await QRSession.create({
      class: classId,
      qrCode,
      createdBy: req.user._id,

      // 🔥 ADDED: fixed session window
      sessionStart,
      sessionEndsAt,

      validFrom,
      validUntil,
      isActive: true,
    });

    const qrImage = await QRCode.toDataURL(
      JSON.stringify({
        sessionId: qrSession._id,
        qrCode,
        classId,
      }),
    );

    res.json({
      sessionId: qrSession._id,
      qrImage,
      validUntil,
      sessionEndsAt,
      expirySeconds: 10,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { sessionId, qrCode } = req.body;

    const qrSession = await QRSession.findById(sessionId).populate("class");

    // 🔐 QR must exist and be active
    if (!qrSession || !qrSession.isActive)
      return res.status(400).json({ message: "QR is invalid or expired" });

    const now = getISTDate();
    // 🔥 NEW: Check fixed 15-minute attendance window
    if (now < qrSession.sessionStart || now > qrSession.sessionEndsAt) {
      qrSession.isActive = false;
      await qrSession.save();

      return res.status(400).json({ message: "Attendance session expired" });
    }

    // QR value must match
    if (qrSession.qrCode !== qrCode)
      return res.status(400).json({ message: "Invalid QR code" });

    // 🔥 Strict 10-second QR validation
    if (now < qrSession.validFrom || now > qrSession.validUntil) {
      return res
        .status(400)
        .json({ message: "QR expired, please scan new QR" });
    }

    const classDoc = await Class.findById(qrSession.class._id);

    // Student must be enrolled
    if (!classDoc.students.includes(req.user._id))
      return res.status(403).json({ message: "Not enrolled in this class" });

    // Prevent duplicate attendance (per day)
    const today = getISTDate();

    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      class: qrSession.class._id,
      student: req.user._id,
      date: { $gte: today },
    });

    if (existingAttendance)
      return res
        .status(400)
        .json({ message: "Attendance already marked for today" });

    const attendance = await Attendance.create({
      class: qrSession.class._id,
      student: req.user._id,
      date: new Date(),
      status: "present",
      markedBy: "qr",
    });
    // ================= CACHE INVALIDATION =================

    // Delete all cached class analytics pages

    const classAnalyticsKeys = await redisClient.keys(
      `classAnalytics:${qrSession.class._id}:*`,
    );

    if (classAnalyticsKeys.length > 0) {
      await redisClient.del(...classAnalyticsKeys);
    }

    // Delete student analytics cache

    await redisClient.del(`studentAnalytics:${req.user._id}`);
    // ================= ATTENDANCE HISTORY CACHE =================

    const attendanceHistoryKeys = await redisClient.keys("attendanceHistory:*");

    if (attendanceHistoryKeys.length > 0) {
      await redisClient.del(...attendanceHistoryKeys);
    }

    console.log("Redis cache invalidated");

    console.log("Analytics cache invalidated");

    // =====================================================

    qrSession.attendees.push({
      student: req.user._id,
      markedAt: new Date(),
    });

    await qrSession.save();

    res.json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fixed: use query param instead of optional route param
export const getAttendanceHistory = async (req, res) => {
  try {
    const classId = req.query.classId;

    // 🔥 PAGINATION PARAMETERS
    // page = current page number
    // limit = number of records per page

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    let cacheKey;

    if (req.user.role === "student") {
      cacheKey = `attendanceHistory:student:${req.user._id}:${classId || "all"}:${page}:${limit}`;
    } else if (req.user.role === "faculty") {
      cacheKey = `attendanceHistory:faculty:${req.user._id}:${classId}:${page}:${limit}`;
    } else {
      cacheKey = `attendanceHistory:admin:${classId}:${page}:${limit}`;
    }

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Serving Attendance History From Redis");

      return res.json(JSON.parse(cachedData));
    }

    // skip tells MongoDB how many records to skip
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user.role === "student") {
      query = { student: req.user._id };

      if (classId) query.class = classId;
    } else if (req.user.role === "faculty") {
      if (!classId)
        return res
          .status(400)
          .json({ message: "classId is required for faculty" });

      const classDoc = await Class.findById(classId);

      if (!classDoc || classDoc.faculty.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Not authorized" });

      query.class = classId;
    } else if (classId) {
      query.class = classId;
    }

    // 🔥 TOTAL RECORDS COUNT
    // Needed to calculate total pages

    const totalRecords = await Attendance.countDocuments(query);

    // 🔥 PAGINATED QUERY

    const attendance = await Attendance.find(query)
      .populate("student", "name studentId")
      .populate("class", "name code")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // 🔥 PAGINATED RESPONSE

    const responseData = {
      attendance,

      currentPage: page,

      totalPages: Math.ceil(totalRecords / limit),

      totalRecords,
    };

    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      EX: 300,
    });

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
