import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    registerNumber: {
      type: String,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'attended', 'cancelled'],
      default: 'confirmed',
    },
    attendedAt: {
      type: Date,
      default: null,
    },
    certificateUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double registration: unique compound index
eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

export const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
