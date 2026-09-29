import mongoose from 'mongoose';

const qrLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Location code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['Seminar Hall', 'Computer Laboratory', 'Auditorium', 'Library', 'Classroom', 'Campus Entrance', 'Innovation Center', 'Sports Complex'],
      default: 'Classroom',
    },
    building: {
      type: String,
      required: true,
      default: 'Main Academic Block',
    },
    floor: {
      type: String,
      default: 'Ground Floor',
    },
    latitude: {
      type: Number,
      required: true,
      default: 11.5997,
    },
    longitude: {
      type: Number,
      required: true,
      default: 77.9868,
    },
    qrIdentifier: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'disabled'],
      default: 'active',
      index: true,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const QrLocation = mongoose.model('QrLocation', qrLocationSchema);
