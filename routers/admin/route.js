const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/auth.js");
const checkRole = require("../../middleware/checkRole.js");

router.get("/", authentication, checkRole(["admin"]), (req, res) => {
  res.render("admin-dashboard.ejs");
});

router.get(
  "/edit/movie/:id",
  authentication,
  checkRole(["admin"]),
  (req, res) => {
    res.render("editmovie.ejs");
  }
);

router.get("/allmovies", authentication, checkRole(["admin"]), (req, res) => {
  res.render("movielist.ejs");
});

router.get("/allseries", authentication, checkRole(["admin"]), (req, res) => {
  res.render("serieslist.ejs");
});

router.get("/addseries", authentication, checkRole(["admin"]), (req, res) => {
  res.render("addseries.ejs", { user: req.session.user });
});

router.get("/addmovie", authentication, checkRole(["admin"]), (req, res) => {
  res.render("addmovie.ejs", { user: req.session.user });
});

module.exports = router;
