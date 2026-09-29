import mongoose from 'mongoose';

const authorizedUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Institutional email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    registerNumber: {
      type: String,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    department: {
      type: String,
      default: 'CSE',
      index: true,
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    section: {
      type: String,
      default: 'A',
      uppercase: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'mentor', 'club_admin', 'admin', 'developer'],
      default: 'student',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'disabled'],
      default: 'active',
      index: true,
    },
    phone: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    assignedMentorEmail: {
      type: String,
      lowercase: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const AuthorizedUser = mongoose.model('AuthorizedUser', authorizedUserSchema);
