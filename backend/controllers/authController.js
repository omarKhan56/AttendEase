//authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


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






const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, department, semester } = req.body;

    // 1. Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Build user object safely
    const userData = {
      name,
      email,
      password,
      role,
      department,
      semester
    };

    // 3. Role-based validation
    if (role === 'student') {
      if (!studentId) {
        return res.status(400).json({
          message: 'Student ID is required for students'
        });
      }
      userData.studentId = studentId;
    }

    // 4. Create user
    const user = await User.create(userData);

    // 5. Response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= PROFILE =================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('PROFILE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    // Only faculty and admin can view all users
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view users' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
