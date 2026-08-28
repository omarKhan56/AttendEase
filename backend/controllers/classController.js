//backend/controllers/classController.js

import Class from "../models/Class.js";
import User from "../models/User.js";
import redisClient, { deleteByPattern } from "../config/redis.js";

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
    await deleteByPattern("classes:*");
    // =============================================================

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClasses = async (req, res) => {
  try {
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

    if (req.user.role === "faculty") {
      query = { faculty: req.user._id };
    } else if (req.user.role === "student") {
      query = { students: req.user._id };
    }

    const totalClasses = await Class.countDocuments(query);

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
      return res.status(404).json({
        message: "Class or student not found",
      });
    }

    if (student.role !== "student") {
      return res.status(400).json({
        message: "User is not a student",
      });
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
    await deleteByPattern("classes:*");
    // =============================================================

    const updatedClass = await Class.findById(classId)
      .populate("faculty", "name email")
      .populate("students", "name studentId");

    res.json({
      message: "Student enrolled successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error("ENROLL ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getClassById = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate("faculty", "name email")
      .populate("students", "name studentId");

    if (!classDoc) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    res.json(classDoc);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};