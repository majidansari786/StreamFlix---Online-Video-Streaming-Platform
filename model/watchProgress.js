const mongoose = require('mongoose')

const watchProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  contentId: { type: String, required: true }, // Movie or Series ID
  contentType: { type: String, enum: ['movie', 'episode'], required: true },
  episodeId: { type: String }, // Format: "season-episode" (e.g., "1-5")
  currentTime: { type: Number, required: true }, // Seconds
  duration: { type: Number, required: true }, // Total duration in seconds
  watchedPercentage: { type: Number, required: true }, // 0-100
  lastWatched: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }, // True if 90%+ watched
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const watchProgressModel = new mongoose.model('watchProgress', watchProgressSchema);

module.exports = watchProgressModel;