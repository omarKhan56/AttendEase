//backend/models/Attendance.js

import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
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
      required: true,
      default: Date.now
    },

    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present'
    },

    qrToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

/* ================= INDEXES ================= */

// Fast analytics queries
attendanceSchema.index({ class: 1 });

// Fast student attendance lookup
attendanceSchema.index({ student: 1 });

attendanceSchema.index({ date: 1 });

attendanceSchema.index({ class: 1, student: 1 });

attendanceSchema.index({ class: 1, date: 1 });

/* ============================================ */

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;