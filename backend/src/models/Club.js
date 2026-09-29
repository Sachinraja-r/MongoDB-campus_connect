import mongoose from 'mongoose';

const clubMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clubRole: {
    type: String,
    enum: ['Faculty Advisor', 'Club Leader', 'Vice President', 'Coordinator', 'Member'],
    default: 'Member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'Institution',
    },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Social', 'Innovation', 'Sports', 'Academic'],
      default: 'Technical',
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    facultyAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    clubLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    coordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [clubMemberSchema],
    achievements: [
      {
        title: String,
        year: String,
        description: String,
      },
    ],
    gallery: [String],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const Club = mongoose.model('Club', clubSchema);
