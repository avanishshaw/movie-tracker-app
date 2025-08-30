import mongoose from 'mongoose';

const mediaEntrySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Movie', 'TV Show'], required: true },
  director: { type: String, required: true, trim: true },
  budget: { type: Number, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  releaseYear: { type: Number, required: true },
  posterUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

mediaEntrySchema.index({ title: 'text', director: 'text' });

const MediaEntry = mongoose.model('MediaEntry', mediaEntrySchema);

export default MediaEntry;