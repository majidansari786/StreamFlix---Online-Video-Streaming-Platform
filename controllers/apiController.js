const path = require('path')
const fs = require('fs')
const User = require('../model/user');
const todomodel = require('../model/todo');
const { render } = require('ejs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { exec } = require('child_process');
const movieapi = require('../model/movie');
const seriesapi = require('../model/seasons');

async function getMovie(req,res) {
  try {
        const movies = await movieapi.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
}

async function addnewmovie(req, res) {
    try {
        const { title, rating, plot, genres, casts, directors, country, poster, movie_src } = req.body;

        const newMovie = new movieapi({
            title,
            rating,
            plot,
            genres,
            casts: casts.split(',').map(name => name.trim()),
            directors: directors.split(',').map(name => name.trim()),
            country,
            poster,
            movie_src
        });

        await newMovie.save();
        res.status(201).json({ success: "New movie added!" });
    } catch (err) {
        console.error("Error adding movie:", err);
        res.status(500).json({ error: "Failed to add movie" });
    }
}

const addnewseries = async (req, res) => {
  try {
    const {
      series_title,
      series_rating,
      series_plot,
      series_genres,
      series_casts,
      series_directors,
      series_country,
      series_poster,
      series_releaseDate,
      series_seasons,
      series_status,
      episodes
    } = req.body;

    const newSeries = new seriesapi({
      title: series_title,
      rating: series_rating,
      plot: series_plot,
      genres: series_genres ? series_genres.split(',').map(g => g.trim()) : [],
      casts: series_casts ? series_casts.split(',').map(c => c.trim()) : [],
      directors: series_directors ? series_directors.split(',').map(d => d.trim()) : [],
      country: series_country,
      poster: series_poster,
      releaseDate: series_releaseDate,
      seasons: series_seasons,
      episodes: episodes || [],
      status: series_status
    });

    await newSeries.save();
    res.status(200).json({ message: 'Series added successfully' });
  } catch (err) {
    console.error('Error adding series:', err);
    res.status(500).json({ message: 'Error adding series', error: err.message });
  }
};

async function getmoviebyId(req,res){
  try{
    const moviebyid = req.params.id;
    const movie = await movieapi.findOne({_id: moviebyid});
    const similar = await movieapi.find({
      _id: { $ne: movie._id },
      genres: { $in: movie.genres }
    }).limit(8).lean();
    res.render('movie.ejs', { movie, similar });
  }catch(error){
    console.log('An error Occured: ',error);
  }
  }

module.exports = {
    addnewmovie,
    addnewseries,
    getMovie,
    getmoviebyId
};