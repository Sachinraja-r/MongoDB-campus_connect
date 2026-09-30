import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'mentor', 'club_admin', 'admin', 'developer'],
      default: 'student',
      index: true,
    },
    department: {
      type: String,
      enum: ['CSE', 'IT', 'AI & DS', 'CSBS', 'ECE', 'EEE', 'Mechanical', 'Civil', 'General Engineering', 'Administration'],
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
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    phone: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'disabled'],
      default: 'active',
      index: true,
    },
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // Privacy and notification preferences
    privacySettings: {
      showPresenceToFriends: { type: Boolean, default: true },
      showSkills: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Password for credential-based login (optional — users can also use Google OAuth)
    passwordHash: {
      type: String,
      default: null,
      select: false, // never returned in queries by default
    },

  },
  {
    timestamps: true,
  }
);

// Search index on name, registerNumber, department
userSchema.index({ name: 'text', registerNumber: 'text', department: 'text' });

export const User = mongoose.model('User', userSchema);
