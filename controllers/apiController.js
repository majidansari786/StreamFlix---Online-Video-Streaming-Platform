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
const otpgen = require("otp-generator");
const nodemailer = require("nodemailer");
const otpModel = require("../model/otp");
const WatchProgress = require('../model/watchProgress');

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
      movie_src,
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

async function movieUpdateAll(req, res) {
  const id = req.params.id;
  const { title, rating, plot, duration, country, poster, movie_src } =
    req.body;
  const updateFields = {};
  if (title) updateFields.title = title;
  if (rating) updateFields.rating = rating;
  if (plot) updateFields.plot = plot;
  if (duration) updateFields.duration = duration;
  if (country) updateFields.country = country;
  if (poster) updateFields.poster = poster;
  if (movie_src) updateFields.movie_src = movie_src;
  if (Object.keys(updateFields).length == 0) {
    return res
      .status(400)
      .json({ error: "No valid field provided for update" });
  }

  try {
    const updatedmovie = await movieapi.findOneAndUpdate(
      { _id: id },
      { ...updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedmovie) {
      return res.status(404).json({ error: "Movie not found." });
    }
    console.log(updatedmovie);
    res
      .status(200)
      .json({ success: "Movie updated successfully.", updatedmovie });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function seriesUpdateAll(req, res) {
  const id = req.params.id;
  const { title, rating, plot, duration, country, poster, movie_src } =
    req.body;
  const updateFields = {};
  if (title) updateFields.title = title;
  if (rating) updateFields.rating = rating;
  if (plot) updateFields.plot = plot;
  if (duration) updateFields.duration = duration;
  if (country) updateFields.country = country;
  if (poster) updateFields.poster = poster;
  if (movie_src) updateFields.movie_src = movie_src;
  if (Object.keys(updateFields).length == 0) {
    return res
      .status(400)
      .json({ error: "No valid field provided for update" });
  }

  try {
    const updatedmovie = await movieapi.findOneAndUpdate(
      { _id: id },
      { ...updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedmovie) {
      return res.status(404).json({ error: "Movie not found." });
    }
    console.log(updatedmovie);
    res
      .status(200)
      .json({ success: "Movie updated successfully.", updatedmovie });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function otpGenerator(req, res) {
  const { email } = req.body;
  const otp = otpgen.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  try {
    await otpModel.create({ email, otp });
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.GPASS,
      },
    });
    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP VERIFICATION",
      text: `Your OTP for verification is: ${otp}`,
    });
    res.status(200).json({ success: "otp sent successfully" });
  } catch (err) {
    console.error("Error generating OTP:", err);
    res.status(400).json({ error: `${err}` });
  }
}

async function otpVerify(req, res) {
  const { email, otp } = req.body;
  try {
    const verifying = await otpModel.findOne({ email, otp }).exec();
    if (verifying) {
      User.findOneAndUpdate(
        { email: email },
        { verified: true },
        { new: true, runValidators: true }
      ).then((updatedUser) => {
        console.log(updatedUser);
      });
      res.status(200).json({ success: "verification complete" });
    } else {
      res.status(401).json({ error: "otp not matched" });
    }
  } catch (err) {
    res.status(401).json({ error: `${err}` });
  }
}

async function watchProgress(req,res) {
  try {
    const { userId, contentId, episodeId } = req.params
    
    // Verify user authentication
    if (!req.user || req.user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const query = {
      userId,
      contentId,
      contentType: episodeId ? 'episode' : 'movie'
    }
    
    if (episodeId) {
      query.episodeId = episodeId
    }
    
    const progress = await WatchProgress.findOne(query)
    
    if (!progress) {
      return res.status(404).json({ error: 'No progress found' })
    }
    
    res.json(progress)
  } catch (error) {
    console.error('Error fetching watch progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function watchProgresSave(req,res) {
  try {
    const { userId } = req.params
    const progressData = req.body
    
    // Verify user authentication
    if (!req.user || req.user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Validate required fields
    if (!progressData.contentId || !progressData.contentType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Ensure numeric values are valid
    progressData.currentTime = Math.max(0, parseFloat(progressData.currentTime) || 0)
    progressData.duration = Math.max(0, parseFloat(progressData.duration) || 0)
    progressData.watchedPercentage = Math.min(100, Math.max(0, parseFloat(progressData.watchedPercentage) || 0))
    
    const query = {
      userId,
      contentId: progressData.contentId,
      contentType: progressData.contentType
    }
    
    if (progressData.episodeId) {
      query.episodeId = progressData.episodeId
    }
    
    const progress = await WatchProgress.findOneAndUpdate(
      query,
      { 
        ...progressData, 
        userId,
        updatedAt: new Date() 
      },
      { upsert: true, new: true }
    )
    
    res.json({ success: true, progress })
  } catch (error) {
    console.error('Error saving watch progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function basicSearch(req,res) {
  try {
    const {
      q: query,
      genre,
      year,
      rating,
      country,
      sort = 'relevance',
      limit = 20,
      offset = 0,
      type // 'movie', 'series', or 'all'
    } = req.query

    // Build search query
    const searchQuery = {}
    
    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { plot: { $regex: query, $options: 'i' } },
        { genres: { $in: [new RegExp(query, 'i')] } },
        { casts: { $in: [new RegExp(query, 'i')] } },
        { directors: { $in: [new RegExp(query, 'i')] } }
      ]
    }

    // Apply filters
    if (genre) {
      searchQuery.genres = { $in: [genre] }
    }
    
    if (year) {
      const startDate = new Date(`${year}-01-01`)
      const endDate = new Date(`${year}-12-31`)
      searchQuery.releaseDate = { $gte: startDate, $lte: endDate }
    }
    
    if (rating) {
      searchQuery.rating = { $gte: parseFloat(rating) }
    }
    
    if (country) {
      searchQuery.country = country
    }

    // Determine sort order
    let sortQuery = {}
    switch (sort) {
      case 'title':
        sortQuery = { title: 1 }
        break
      case 'year':
        sortQuery = { releaseDate: -1 }
        break
      case 'rating':
        sortQuery = { rating: -1 }
        break
      case 'relevance':
      default:
        // For text search, MongoDB will sort by relevance automatically
        if (query) {
          sortQuery = { score: { $meta: 'textScore' } }
        } else {
          sortQuery = { releaseDate: -1 }
        }
        break
    }

    let results = []

    // Search movies and series based on type filter
    if (!type || type === 'all' || type === 'movie') {
      const movies = await movieapi.find(searchQuery)
        .sort(sortQuery)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean()
      
      results = results.concat(movies.map(movie => ({ ...movie, type: 'movie' })))
    }

    if (!type || type === 'all' || type === 'series') {
      const series = await seriesapi.find(searchQuery)
        .sort(sortQuery)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean()
      
      results = results.concat(series.map(show => ({ ...show, type: 'series' })))
    }

    // Get total count for pagination
    const totalMovies = !type || type === 'all' || type === 'movie' 
      ? await movieapi.countDocuments(searchQuery) 
      : 0
    const totalSeries = !type || type === 'all' || type === 'series' 
      ? await seriesapi.countDocuments(searchQuery) 
      : 0
    const totalResults = totalMovies + totalSeries

    res.json({
      results,
      pagination: {
        total: totalResults,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalResults
      },
      filters: {
        availableGenres: await getAvailableGenres(),
        availableCountries: await getAvailableCountries(),
        availableYears: await getAvailableYears()
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

async function getAvailableGenres() {
  const [movieGenres, seriesGenres] = await Promise.all([
    Movie.distinct('genres'),
    Series.distinct('genres')
  ])
  return [...new Set([...movieGenres, ...seriesGenres])].sort()
}

async function getAvailableCountries() {
  const [movieCountries, seriesCountries] = await Promise.all([
    Movie.distinct('country'),
    Series.distinct('country')
  ])
  return [...new Set([...movieCountries, ...seriesCountries])].sort()
}

async function getAvailableYears() {
  const [movieYears, seriesYears] = await Promise.all([
    Movie.distinct('releaseDate'),
    Series.distinct('releaseDate')
  ])
  const allDates = [...movieYears, ...seriesYears]
  const years = allDates.map(date => new Date(date).getFullYear())
  return [...new Set(years)].sort((a, b) => b - a)
}

async function quickSearch(req,res) {
  try {
    const { q: query, limit = 10 } = req.query
    
    if (!query) {
      return res.json([])
    }

    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { genres: { $in: [new RegExp(query, 'i')] } }
      ]
    }

    const [movies, series] = await Promise.all([
      movieapi.find(searchQuery)
        .select('title poster releaseDate rating')
        .limit(parseInt(limit) / 2)
        .lean(),
      seriesapi.find(searchQuery)
        .select('title poster releaseDate rating seasons')
        .limit(parseInt(limit) / 2)
        .lean()
    ])

    const suggestions = [
      ...movies.map(movie => ({
        _id: movie._id,
        title: movie.title,
        poster: movie.poster,
        type: 'movie',
        year: new Date(movie.releaseDate).getFullYear(),
        rating: movie.rating
      })),
      ...series.map(show => ({
        _id: show._id,
        title: show.title,
        poster: show.poster,
        type: 'series',
        year: new Date(show.releaseDate).getFullYear(),
        rating: show.rating,
        seasons: show.seasons
      }))
    ].slice(0, parseInt(limit))

    res.json(suggestions)
  } catch (error) {
    res.status(500).json({ error: error.message })
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
  movieUpdateAll,
  seriesUpdateAll,
  otpGenerator,
  otpVerify,
  watchProgresSave,
  watchProgress,
  basicSearch,
  quickSearch
};
