import mongoose from 'mongoose';

const presenceEventSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QrLocation',
      required: true,
      index: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['CHECK_IN', 'CHECK_OUT'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: null,
    },
    presenceSource: {
      type: String,
      enum: ['QR', 'RFID', 'NFC', 'IoT'],
      default: 'QR',
    },
  },
  {
    timestamps: true,
  }
);

export const PresenceEvent = mongoose.model('PresenceEvent', presenceEventSchema);
