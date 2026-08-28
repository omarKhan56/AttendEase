import mongoose from 'mongoose';

const spotCheckSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    confirmedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    flaggedStudents: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resolved: { type: Boolean, default: false },
        resolutionNote: { type: String },
      },
    ],
  },
  { timestamps: true }
);

spotCheckSchema.index({ class: 1, date: -1 });

export default mongoose.model('SpotCheck', spotCheckSchema);