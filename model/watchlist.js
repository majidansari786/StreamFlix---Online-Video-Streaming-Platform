const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  list: {
    type: Map,
    of: String,
    default: {},
  },
});

const watchlist = new mongoose.model("watching-list", schema);

module.exports = watchlist;
