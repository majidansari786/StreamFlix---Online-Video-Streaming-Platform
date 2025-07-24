const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const encodeController = require("../../controllers/videoController");
const videosController = require("../../controllers/apiController");
const userController = require("../../controllers/userController");
const checkRole = require("../../middleware/checkRole");
const auth = require("../../middleware/auth");
const multer = require("multer");
const { use } = require("passport");
const cookieParser = require("cookie-parser");

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/upload/videos/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app = express();
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../../views"));

router.post(
  "/addmovie",
  auth,
  checkRole(["user", "admin"]),
  upload.single("movie_src"),
  videosController.addnewmovie
);
router.post(
  "/addseries",
  auth,
  checkRole(["user", "admin"]),
  videosController.addnewseries
);
router.post(
  "/encode",
  auth,
  checkRole(["user", "admin"]),
  encodeController.encode
);
router.post(
  "/watchlist",
  auth,
  checkRole(["user", "admin"]),
  userController.userwatchlist
);

router.post("/login", userController.handleUserLogin);
router.post("/update/movie/:id", videosController.movieUpdateAll);

router.get("/similar/:id", videosController.similar);
router.get("/watchlist/:email", userController.listpage);
router.get("/movies", videosController.getMovie);
router.get("/series", videosController.getseries);
router.get("/movies/:id", videosController.getmoviebyIds);
router.get("/series/:id", videosController.getseriesbyIds);
router.get(
  "/profile",
  auth,
  checkRole(["user", "admin"]),
  userController.userProfile
);

module.exports = router;
