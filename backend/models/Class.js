//backend/models/Class.js

import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    code: {
      type: String,
      required: true,
      unique: true
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    department: {
      type: String
    },

    semester: {
      type: Number
    },

    academicYear: {
      type: String
    },

    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/* ================= INDEXES ================= */




// Fast faculty class loading
classSchema.index({ faculty: 1 });

// Fast department filtering
classSchema.index({ department: 1 });

// Fast semester filtering
classSchema.index({ semester: 1 });

/* ============================================ */

const Class = mongoose.model('Class', classSchema);

export default Class;