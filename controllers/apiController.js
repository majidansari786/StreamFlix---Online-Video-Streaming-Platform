const path = require("path");
const fs = require("fs");
const User = require("../model/user");
const todomodel = require("../model/todo");
const { render } = require("ejs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { exec } = require("child_process");
const movieapi = require("../model/movie");
const seriesapi = require("../model/seasons");
const { default: mongoose } = require("mongoose");

async function getMovie(req, res) {
  try {
    const movies = await movieapi.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
}

async function getseries(req, res) {
  try {
    const series = await seriesapi.find();
    res.status(200).json(series);
  } catch (error) {
    console.log("Failed to fetch series", error);
  }
}

async function addnewmovie(req, res) {
  try {
    const {
      title,
      rating,
      plot,
      genres,
      casts,
      directors,
      country,
      poster,
      movie_src,
    } = req.body;

    const newMovie = new movieapi({
      title,
      rating,
      plot,
      genres,
      casts: casts.split(",").map((name) => name.trim()),
      directors: directors.split(",").map((name) => name.trim()),
      country,
      poster,
      movie_src: req.file.path,
    });

    await newMovie.save();
    res.status(201).json({ success: "New movie added!" });
  } catch (err) {
    console.error("Error adding movie:", err);
    res.status(500).json({ error: "Failed to add movie" });
  }
}

const commaSplit = (val) =>
  val
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) || [];

const addnewseries = async (req, res) => {
  try {
    const {
      title,
      rating,
      plot,
      genres,
      casts,
      directors,
      country,
      poster,
      trailer,
      releaseDate,
      seasons,
      status,
    } = req.body;

    // Parse genres, casts, and directors if they are comma-separated strings
    const parsedGenres = Array.isArray(genres) ? genres : commaSplit(genres);
    const parsedCasts = Array.isArray(casts) ? casts : commaSplit(casts);
    const parsedDirectors = Array.isArray(directors)
      ? directors
      : commaSplit(directors);

    // Parse episodes if submitted as HTML form (single episode)
    let episodes = [];

    if (req.body.episodes) {
      // Handle single episode or multiple
      const rawEpisodes = req.body.episodes;

      if (Array.isArray(rawEpisodes)) {
        episodes = rawEpisodes.map((e) => ({
          season: parseInt(e.season),
          episodeNumber: parseInt(e.episodeNumber),
          title: e.title,
          duration: parseInt(e.duration),
          airDate: e.airDate || null,
          description: e.description || null,
          episode_src: e.episode_src,
          episode_thumbnail: e.episode_thumbnail,
        }));
      } else {
        // Single episode case
        episodes.push({
          season: parseInt(rawEpisodes.season),
          episodeNumber: parseInt(rawEpisodes.episodeNumber),
          title: rawEpisodes.title,
          duration: parseInt(rawEpisodes.duration),
          airDate: rawEpisodes.airDate || null,
          description: rawEpisodes.description || null,
          episode_src: rawEpisodes.episode_src,
          episode_thumbnail: rawEpisodes.episode_thumbnail,
        });
      }
    }

    const newSeries = new seriesapi({
      title,
      rating,
      plot,
      genres: parsedGenres,
      casts: parsedCasts,
      directors: parsedDirectors,
      country,
      poster,
      trailer,
      releaseDate,
      seasons,
      status,
      episodes,
    });

    const saved = await newSeries.save();
    res.status(201).json({ message: "Series added successfully", saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

async function getmoviebyId(req, res) {
  try {
    const moviebyid = req.params.id;
    const movie = await movieapi.findById(moviebyid);
    if (!movie) {
      const seriesid = req.params.id;
      const series = await seriesapi.findOne({ _id: seriesid });
      const similar = await seriesapi
        .find({
          _id: { $ne: series._id },
          genres: { $in: series.genres },
        })
        .limit(8)
        .lean();
      res.render("series.ejs", { series, similar });
    } else {
      const similar = await movieapi
        .find({
          _id: { $ne: movie._id },
          genres: { $in: movie.genres },
        })
        .limit(8)
        .lean();
      res.render("movie.ejs", { movie, similar });
    }
  } catch (error) {
    console.log("An error Occured: ", error);
  }
}

async function getmoviebyIds(req, res) {
  try {
    const moviebyid = req.params.id;
    const movie = await movieapi.findById(moviebyid);
    res.json(movie);
  } catch (error) {
    console.log("An error Occured: ", error);
  }
}

async function getseriesbyIds(req, res) {
  try {
    const seriesbyid = req.params.id;
    const series = await seriesapi.findById(seriesbyid);
    res.json(series);
  } catch (error) {
    console.log("An error Occured: ", error);
  }
}

async function similar(req, res) {
  try {
    const moviebyid = req.params.id;
    const movie = await movieapi.findById(moviebyid);
    if (!movie) {
      const series = await seriesapi.findById(moviebyid);
      const similar = await seriesapi.find({
        _id: { $ne: series._id },
        genres: { $in: series.genres },
      });
      res.json(similar);
    } else {
      const similar = await movieapi.find({
        _id: { $ne: movie._id },
        genres: { $in: movie.genres },
      });
      res.json(similar);
    }
  } catch (error) {
    console.log(error);
  }
}

async function userfirstUpdate(req, res) {
  const { firstname } = req.body;
  const user_id = req.user.id;
  if (!user_id) {
    return res.status(404).json({ error: "user not found" });
  }
  try {
    User.findOneAndUpdate(
      { _id: user_id },
      { firstname: firstname },
      { new: true, runValidators: true }
    ).then((updatedUser) => {
      console.log(updatedUser);
    });
    res.status(202).json({ success: "user updated!" });
  } catch (error) {
    console.log(error);
  }
}

async function userlastnameUpdate(req, res) {
  const { lastname } = req.body;
  const user_id = req.user.id;
  if (!user_id) {
    return res.status(404).json({ error: "user not found" });
  }
  try {
    User.findOneAndUpdate(
      { _id: user_id },
      { lastname: lastname },
      { new: true, runValidators: true }
    ).then((updatedUser) => {
      console.log(updatedUser);
    });
    res.status(202).json({ success: "user updated!" });
  } catch (error) {
    console.log(error);
  }
}

async function movieUpdateAll(req,res) {
  const id = req.params.id;
  const {
    title,
    rating,
    plot,
    duration,
    country,
    poster,
    movie_src
  } = req.body;
  const updateFields = {};
  if(title) updateFields.title = title;
  if (rating) updateFields.rating = rating;
  if (plot) updateFields.plot = plot;
  if (duration) updateFields.duration = duration;
  if (country) updateFields.country = country;
  if (poster) updateFields.poster = poster;
  if (movie_src) updateFields.movie_src = movie_src;
  if(Object.keys(updateFields).length == 0){
    return res.status(400).json({ error: 'No valid field provided for update'})
  }

  try{
    const updatedmovie = await movieapi.findOneAndUpdate(
      {_id: id},
      {...updateFields},
      { new: true, runValidators: true }
    );
     if (!updatedmovie) {
      return res.status(404).json({ error: "Movie not found." });
    }
    console.log(updatedmovie);
    res.status(200).json({ success: "Movie updated successfully.", updatedmovie });
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }

}

module.exports = {
  addnewmovie,
  addnewseries,
  getMovie,
  getseries,
  getmoviebyId,
  getmoviebyIds,
  getseriesbyIds,
  similar,
  userfirstUpdate,
  userlastnameUpdate,
  movieUpdateAll
};
