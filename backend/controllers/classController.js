//backend/controllers/classController.js

import Class from "../models/Class.js";
import User from "../models/User.js";
import redisClient from "../config/redis.js";

//🏫 classController.js – Class management
//What it handles:
//Creating classes
//Fetching classes based on role
//Enrolling students

/* Main Purpose

 Manages academic classes and student enrollment

Key Functions

Create classes (only faculty)

Prevent duplicate class codes

Fetch classes based on user role

Enroll students and maintain two-way relationships

Associate classes with faculty ownership

One-line interview summary

“classController handles class creation, role-based class access, and student enrollment.”
*/

/* 200 – Success
201 – Created
400 – Bad Request
401 – Unauthorized
403 – Forbidden
404 – Not Found
500 – Internal Server Error*/

export const createClass = async (req, res) => {
  try {
    const { name, code, department, semester, schedule, academicYear } =
      req.body;

    const classExists = await Class.findOne({ code });

    if (classExists) {
      return res.status(400).json({ message: "Class code already exists" });
    }

    const newClass = await Class.create({
      name,
      code,
      faculty: req.user._id,
      department,
      semester,
      schedule,
      academicYear,
    });
    // ================= CLASSES CACHE INVALIDATION =================

    const classKeys = await redisClient.keys("classes:*");

    if (classKeys.length > 0) {
      await redisClient.del(...classKeys);
    }

    // =============================================================

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClasses = async (req, res) => {
  try {
    // 🔥 PAGINATION PARAMETERS

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 6;
    const cacheKey = `classes:${req.user.role}:${req.user._id}:${page}:${limit}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Serving Classes From Redis");

      return res.json(JSON.parse(cachedData));
    }

    const skip = (page - 1) * limit;

    let query = {};

    // 🔥 ROLE-BASED QUERY

    if (req.user.role === "faculty") {
      query = { faculty: req.user._id };
    } else if (req.user.role === "student") {
      query = { students: req.user._id };
    }

    // 🔥 TOTAL COUNT

    const totalClasses = await Class.countDocuments(query);

    // 🔥 FETCH PAGINATED CLASSES

    let classes;

    if (req.user.role === "faculty") {
      classes = await Class.find(query)
        .populate("faculty", "name email")
        .populate("students", "name studentId")
        .skip(skip)
        .limit(limit);
    } else if (req.user.role === "student") {
      classes = await Class.find(query)
        .populate("faculty", "name email")
        .skip(skip)
        .limit(limit);
    } else {
      classes = await Class.find(query)
        .populate("faculty", "name email")
        .populate("students", "name studentId")
        .skip(skip)
        .limit(limit);
    }

    // 🔥 RETURN PAGINATED RESPONSE

    const responseData = {
      classes,

      currentPage: page,

      totalPages: Math.ceil(totalClasses / limit),

      totalClasses,
    };

    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      EX: 300,
    });

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const enrollStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    const classDoc = await Class.findById(classId);

    const student = await User.findById(studentId);

    if (!classDoc || !student) {
      return res.status(404).json({ message: "Class or student not found" });
    }

    if (student.role !== "student") {
      return res.status(400).json({ message: "User is not a student" });
    }

    if (classDoc.students.some((id) => id.toString() === studentId)) {
      return res.status(400).json({
        message: "Student already enrolled",
      });
    }

    await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        students: studentId,
      },
    });

    await User.findByIdAndUpdate(studentId, {
      $addToSet: {
        enrolledClasses: classId,
      },
    });
    // ================= CLASSES CACHE INVALIDATION =================

    const classKeys = await redisClient.keys("classes:*");

    if (classKeys.length > 0) {
      await redisClient.del(...classKeys);
    }

    // =============================================================

    res.json({ message: "Student enrolled successfully" });
  } catch (error) {
    console.error("ENROLL ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
