//backend/models/User.js
//backend/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student'
    },

    studentId: {
      type: String,
      sparse: true,
      unique: true
    },

    department: {
      type: String
    },

    semester: {
      type: Number
    },

    enrolledClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
      }
    ]
  },
  {
    timestamps: true
  }
);

/* ================= INDEXES ================= */

// Fast login
userSchema.index({ email: 1 });

// Fast student lookup
userSchema.index({ studentId: 1 });

// Fast role filtering
userSchema.index({ role: 1 });

/* ============================================ */

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;