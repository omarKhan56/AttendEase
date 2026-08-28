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

    // NEW: was being passed to .create() already but silently dropped —
    // the schema never actually defined this field until now.
    markedBy: {
      type: String,
      enum: ['qr', 'qr+biometric'],
      default: 'qr'
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

attendanceSchema.index({ class: 1 });
attendanceSchema.index({ student: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ class: 1, student: 1 });
attendanceSchema.index({ class: 1, date: 1 });

/* ============================================ */

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;