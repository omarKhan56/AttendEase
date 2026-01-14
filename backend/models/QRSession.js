import mongoose from 'mongoose';

const qrSessionSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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

// Auto-expire QR codes
qrSessionSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('QRSession', qrSessionSchema);