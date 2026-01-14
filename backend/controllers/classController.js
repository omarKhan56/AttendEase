//classController.js
import Class from '../models/Class.js';
import User from '../models/User.js';



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

“classController handles class creation, role-based class access, and student enrollment.”*/



export const createClass = async (req, res) => {
  try {
    const { name, code, department, semester, schedule, academicYear } = req.body;

    const classExists = await Class.findOne({ code });
    if (classExists) {
      return res.status(400).json({ message: 'Class code already exists' });
    }

    const newClass = await Class.create({
      name,
      code,
      faculty: req.user._id,
      department,
      semester,
      schedule,
      academicYear
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClasses = async (req, res) => {
  try {
    let classes;
    
    if (req.user.role === 'faculty') {
      classes = await Class.find({ faculty: req.user._id })
        .populate('faculty', 'name email')
        .populate('students', 'name studentId');
    } else if (req.user.role === 'student') {
      classes = await Class.find({ students: req.user._id })
        .populate('faculty', 'name email');
    } else {
      classes = await Class.find()
        .populate('faculty', 'name email')
        .populate('students', 'name studentId');
    }

    res.json(classes);
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
      return res.status(404).json({ message: 'Class or student not found' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }

    if (classDoc.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    classDoc.students.push(studentId);
    student.enrolledClasses.push(classId);

    await classDoc.save();
    await student.save();

    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};