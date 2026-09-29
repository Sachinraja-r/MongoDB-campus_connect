import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Slide title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    tag: {
      type: String,
      default: 'FEATURED',
    },
    ctaLabel: {
      type: String,
      default: 'Explore Now',
    },
    ctaDestination: {
      type: String,
      default: '/events',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
