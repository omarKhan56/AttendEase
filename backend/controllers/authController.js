import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Controllers are the brain of your backend logic.
//They receive requests from routes
//They talk to models (database)
//They apply business logic
//They send responses back to the client

//What this controller does:
//Login users
//Generate JWT tokens
//Register users
//Get user profile
//Get all users (admin/faculty)

//This controller handles who you are and what you’re allowed to do.

/* Key Functions

Register users with role-based validation (student / faculty / admin)

Login users by verifying credentials

Generate JWT tokens for secure authentication

Protect sensitive data by excluding passwords

Fetch user profile and all users (role-based)*/

// GENERATE JWT TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    let { name, email, password, role, studentId, department, semester } =
      req.body;

    // CLEAN INPUTS
    name = name?.trim();
    email = email?.trim().toLowerCase();

    // CHECK EXISTING USER
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // NAME VALIDATION
    if (!name || name.length < 3) {
      return res.status(400).json({
        message: "Name must contain at least 3 characters",
      });
    }

    // ONLY ALPHABETS + SPACES
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Name should contain only alphabets",
      });
    }

    // EMAIL FORMAT VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // FACULTY EMAIL RESTRICTION
    if (role === "faculty") {
      if (!email.endsWith("@mgmjnec.org")) {
        return res.status(400).json({
          message: "Faculty must register using @mgmjnec.org email",
        });
      }
    }

    // BUILD USER OBJECT
    const userData = {
      name,
      email,
      password,
      role,
      department,
      semester,
    };

    // STUDENT VALIDATION
    if (role === "student") {
      if (!studentId) {
        return res.status(400).json({
          message: "Student ID is required for students",
        });
      }

      userData.studentId = studentId;
    }

    // CREATE USER
    const user = await User.create(userData);

    // RESPONSE
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= PROFILE =================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "faculty" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to view users",
      });
    }

    const users = await User.find().select("-password");

    res.json({
      users,
      totalPages: 1,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
