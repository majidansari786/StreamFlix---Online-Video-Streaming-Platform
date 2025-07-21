const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    plot: {
        type: String,
        required: true
    },
    genres: {
        type: [String],
        default: null
    },
    casts: {
        type: [String],
        default: null
    }, 
    directors: {
        type: [String],
        default: null
    },
    country: {
        type: String,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    trailer: {
        type: String,
        default: null
    },
    releaseDate: {
    type: Date,
    default: null
    },
    seasons: {
    type: Number,
    required: true,
    min: 1
    },
    episodes: [{
        season: {
            type: Number,
            required: true
        },
        episodeNumber: {
        type: Number,
        required: true
        },
        title: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        airDate: {
            type: Date,
            default: null
            //   required: true
        },
        description: {
            type: String,
            default: null
            //   required: true
        },
        episode_src: {
            type: String,
            required: true
        },

        episode_thumbnail: {
            type: String,
            default: null
        }
    }],
    status: {
        type: String,
        enum: ['Ongoing', 'Completed', 'Cancelled'],
        default: 'Ongoing'
    }
});

const seriesModel = new mongoose.model('series', seriesSchema);

module.exports = seriesModel;