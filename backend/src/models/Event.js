import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Technical',
        'Coding',
        'Hackathon',
        'Workshop',
        'Seminar',
        'Cultural',
        'Sports',
        'Academic',
        'Competition',
        'Innovation',
        'Other',
      ],
      default: 'Technical',
      index: true,
    },
    poster: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    organizerType: {
      type: String,
      enum: ['club', 'department', 'institution'],
      default: 'club',
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
      index: true,
    },
    department: {
      type: String,
      default: 'All',
      index: true,
    },
    facultyCoordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    studentCoordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      default: '09:30 AM',
    },
    endTime: {
      type: String,
      default: '04:30 PM',
    },
    venue: {
      type: String,
      required: true,
    },
    eligibility: {
      type: String,
      default: 'Open to all KIOT students',
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    registrationCount: {
      type: Number,
      default: 0,
    },
    prizes: {
      type: String,
      default: '',
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ date: 1, status: 1 });

export const Event = mongoose.model('Event', eventSchema);
