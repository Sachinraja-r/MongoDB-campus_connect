import mongoose from 'mongoose';

const presenceSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One active presence session per student!
      index: true,
    },
    status: {
      type: String,
      enum: ['IN', 'OUT'],
      default: 'OUT',
      index: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QrLocation',
      default: null,
    },
    locationName: {
      type: String,
      default: null,
    },
    enteredAt: {
      type: Date,
      default: null,
    },
    exitedAt: {
      type: Date,
      default: null,
    },
    presenceSource: {
      type: String,
      enum: ['QR', 'RFID', 'NFC', 'IoT'],
      default: 'QR',
    },
    lastScanAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const PresenceSession = mongoose.model('PresenceSession', presenceSessionSchema);
