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
const HighrateLimiter = require("../../middleware/Highratelimit");
const LowrateLimiter = require("../../middleware/LowrateLimiter");
const apiSecurity = require("../../middleware/apiSecurity");

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
  apiSecurity,
  auth,
  checkRole(["user", "admin"]),
  upload.single("movie_src"),
  videosController.addnewmovie
);
router.post(
  "/addseries",
  apiSecurity,
  auth,
  checkRole(["user", "admin"]),
  videosController.addnewseries
);
router.post(
  "/encode",
  apiSecurity,
  auth,
  checkRole(["user", "admin"]),
  encodeController.encode
);
router.post(
  "/watchlist",
  apiSecurity,
  auth,
  HighrateLimiter,
  checkRole(["user", "admin"]),
  userController.userwatchlist
);

router.post("/login", apiSecurity, LowrateLimiter, userController.handleUserLogin);
router.post("/update/movie/:id", apiSecurity, videosController.movieUpdateAll);
router.post("/update/series/:id", apiSecurity, videosController.seriesUpdateAll);
router.post("/otpgenerate", apiSecurity, LowrateLimiter, videosController.otpGenerator);
router.post("/otpverify", apiSecurity, LowrateLimiter, videosController.otpVerify);
router.post("/api/watch-progress/:userId", apiSecurity, videosController.watchProgresSave);

router.get('/api/watch-progress/:userId/:contentId/:episodeId?', apiSecurity, videosController.watchProgress)
router.get("/similar/:id", apiSecurity, HighrateLimiter, videosController.similar);
router.get("/watchlist/:email", apiSecurity, HighrateLimiter, userController.listpage);
router.get("/movies", apiSecurity, HighrateLimiter, videosController.getMovie);
router.get("/series", apiSecurity, HighrateLimiter, videosController.getseries);
router.get("/movies/:id", apiSecurity, HighrateLimiter, videosController.getmoviebyIds);
router.get("/series/:id", apiSecurity, HighrateLimiter, videosController.getseriesbyIds);
router.get(
  "/profile",
  auth,
  checkRole(["user", "admin"]),
  userController.userProfile
);
router.get(
  "/watch-progress/:userId/:contentId/:episodeId?",
  apiSecurity,
  videosController.watchProgress
);
router.get('/api/search', apiSecurity, videosController.basicSearch);
router.get('/api/search/suggestions', apiSecurity, videosController.quickSearch);
router.get('/api/search', apiSecurity, videosController.basicSearch);

// Download endpoints
router.post('/download', apiSecurity, auth, checkRole(["user", "admin"]), (req, res) => {
  // Mock download endpoint - implement actual download logic
  res.json({ 
    success: true, 
    message: 'Download added to queue',
    downloadId: Date.now().toString()
  });
});

router.get('/downloads/:email', apiSecurity, auth, checkRole(["user", "admin"]), (req, res) => {
  // Mock downloads endpoint - implement actual download tracking
  res.json({ 
    downloads: [],
    message: 'No downloads found'
  });
});

// Test endpoint to verify security
router.get('/test', apiSecurity, (req, res) => {
  res.json({
    message: 'Security test passed!',
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
});

module.exports = router;
