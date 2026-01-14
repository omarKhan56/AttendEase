import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  markedBy: {
    type: String,
    enum: ['qr', 'manual', 'biometric'],
    default: 'qr'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: Number,
    longitude: Number
  }
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ class: 1, student: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);