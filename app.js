const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const connectdb = require("./config/db.js");

const app = express();
connectdb();
app.use(
  session({
    secret:
      "70a544710d30796e2e47f9da7893c848241c1e15f266a15ea0af07e4d8eefd322e289574d3019a945f4598bbc40b756b4ce977f126ed2d95041524d95d35032d",
    resave: false,
    saveUninitialized: false,
  })
);

const port = process.env.PORT;
const cors = require("cors");
app.use(cookieParser());
const { text } = require("body-parser");
// const Corsoption = require('./config/Corsption')

const whitelist = ["http://localhost:3000", "http://127.0.0.1:3000"];
const corsOptions = {
  origin: whitelist,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

//Cross origin sharing
// app.use(cors(Corsoption));

// middleware for handling urlencoded and json data
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

// middleware for serve static files
app.use(express.static("./public"));

// custom middleware for logging
const logs = require("./middleware/logs.js");

app.use((req, res, next) => {
  logs(req.method, req.url, req.headers.origin, req.ip);
  next();
});

// middleware for authentication
const authentication = require("./middleware/auth.js");

// middleware for uploading using multer
const upload = require("./middleware/upload.js");

// middleware for checking role
const checkRole = require("./middleware/checkRole.js");

//custom route from user
const userroutes = require("./routers/user/routes.js");
const apiroutes = require("./routers/api/route.js");
const adminroutes = require("./routers/admin/route.js");
const { type } = require("os");
const { error } = require("console");
app.use("/user", userroutes);
app.use("/api", apiroutes);
app.use("/stream-admin", adminroutes);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/", async (req, res) => {
  const body = req.body;
  if (
    !body ||
    !body.firstname ||
    !body.lastname ||
    !body.email ||
    !body.gender
  ) {
    return res.status(400).json({ error: "All fields are required!" });
  }
  const result = await User.create({
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    gender: body.gender,
  });
  console.log(result);
  res.status(201).json({ message: "User created!" });
});

const apiController = require("./controllers/apiController.js");
app.get("/title/:id", apiController.getmoviebyId);

app.get("/mockdata", (req, res) => {
  const mockdata = require("./MOCK_DATA (1).json");
  res.json(mockdata);
});

app.all("*", (req, res) => {
  res.statusCode = 404;
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "error.html"));
  } else if (req.accepts("html")) {
    res.json({ error: "404 not found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

app.listen(port, () => console.log(`Server running at port ${port}`));
