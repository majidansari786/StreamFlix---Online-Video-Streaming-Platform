const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const usercontroller = require("../../controllers/userController");
const apicontroller = require("../../controllers/apiController");
const checkRole = require("../../middleware/checkRole");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const HighrateLimiter = require("../../middleware/Highratelimit");
const LowrateLimiter = require("../../middleware/LowrateLimiter");

app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../../views"));

router.get("/", HighrateLimiter, usercontroller.getuser);

router.get("/about", (req, res) => {
  res.render("about.ejs");
});

router.get("/login", HighrateLimiter, (req, res) => {
  res.render("login.ejs");
});

router.get("/logout", HighrateLimiter, usercontroller.logout);

router.post("/login", LowrateLimiter, usercontroller.handleUserLogin);

router.post("/signup", LowrateLimiter, usercontroller.handleUserSignup);

router.get("/signup", (req, res) => {
  res.render("register.ejs");
});

router.post("/delete", usercontroller.deleteuser);

router.post("/encode", usercontroller.encode);

// router.get('/refresh',usercontroller.refresh);

router.post("/todo", usercontroller.todo);

router.get("/admin", auth, checkRole(["user", "admin"]), (req, res) => {
  res.send("Welcome, user!");
});

router.get("/dashboard", usercontroller.dashboardController);

router.post(
  "/upload",
  auth,
  checkRole(["admin"]),
  upload.single("file"),
  usercontroller.handleUpload
);
router.post(
  "/firstnameupdate",
  HighrateLimiter,
  auth,
  apicontroller.userfirstUpdate
);
router.post(
  "/lastnameupdate",
  HighrateLimiter,
  auth,
  apicontroller.userlastnameUpdate
);

module.exports = router;
