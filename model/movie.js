const mongoose = require("mongoose");
require("dotenv").config();

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  plot: {
    type: String,
    required: true,
  },
  genres: {
    type: [String],
  },
  casts: {
    type: [String],
  },
  directors: {
    type: [String],
  },
  duration: {
    type: Number,
    default: 0,
  },
  country: {
    type: String,
  },
  poster: {
    type: String,
  },
  movie_src: {
    type: String,
    required: true,
  },
});

const movieModel = new mongoose.model("movies", movieSchema);

module.exports = movieModel;
