import SpotCheck from '../models/SpotCheck.js';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';

// Faculty opens the spot-check screen: get today's marked-present roster
export const getSpotCheckRoster = async (req, res) => {
  try {
    const { classId } = req.params;
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });
    if (classDoc.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      class: classId,
      date: { $gte: startOfDay },
      status: { $in: ['present', 'late'] },
    }).populate('student', 'name studentId');

    res.json({
      className: classDoc.name,
      markedPresent: records.map((r) => ({
        studentId: r.student._id,
        name: r.student.name,
        rollNumber: r.student.studentId,
        markedBy: r.markedBy,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Faculty submits the headcount confirmation
export const submitSpotCheck = async (req, res) => {
  try {
    const { classId, confirmedStudentIds } = req.body;
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });
    if (classDoc.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const markedPresent = await Attendance.find({
      class: classId,
      date: { $gte: startOfDay },
      status: { $in: ['present', 'late'] },
    }).select('student');

    const markedIds = markedPresent.map((r) => r.student.toString());
    const confirmedSet = new Set(confirmedStudentIds);
    const flagged = markedIds
      .filter((id) => !confirmedSet.has(id))
      .map((id) => ({ student: id }));

    const spotCheck = await SpotCheck.create({
      class: classId,
      conductedBy: req.user._id,
      confirmedStudents: confirmedStudentIds,
      flaggedStudents: flagged,
    });

    res.status(201).json(spotCheck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review flagged students across past spot checks for a class
export const getFlaggedStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const spotChecks = await SpotCheck.find({ class: classId })
      .populate('flaggedStudents.student', 'name studentId')
      .sort({ date: -1 });
    res.json(spotChecks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Faculty/admin marks a flagged case as reviewed
export const resolveFlaggedStudent = async (req, res) => {
  try {
    const { spotCheckId, studentId } = req.params;
    const { resolutionNote } = req.body;
    const spotCheck = await SpotCheck.findById(spotCheckId);
    if (!spotCheck) return res.status(404).json({ message: 'Spot check not found' });

    const entry = spotCheck.flaggedStudents.find(
      (f) => f.student.toString() === studentId
    );
    if (!entry) return res.status(404).json({ message: 'Flagged entry not found' });

    entry.resolved = true;
    entry.resolutionNote = resolutionNote || '';
    await spotCheck.save();

    res.json(spotCheck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};