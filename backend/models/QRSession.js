//qrSessionSchema.js
import mongoose from 'mongoose';

const qrSessionSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },

  // 🔥 NEW: Fixed 15-minute attendance window
  sessionStart: {
    type: Date,
    required: true
  },
  sessionEndsAt: {
    type: Date,
    required: true
  },

  qrCode: {
    type: String,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 10-second QR validity window
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  attendees: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: Date
  }]
});

// Auto-expire QR session AFTER 15 MINUTES
qrSessionSchema.index({ sessionEndsAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('QRSession', qrSessionSchema);
