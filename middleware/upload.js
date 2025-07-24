const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { dir } = require("console");
const user_file = require("../model/user_files");
const User = require("../model/user");
const dirPath = path.join(__dirname, "../", "uploads");

// if(!fs.existsSync(dirPath)){
//     fs.mkdirSync(dirPath);
// };

async function filename_saving_in_db(filename, email) {
  const newdata = new user_file({
    filename,
    email: email,
  });
  await newdata.save();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const file_name = Date.now() + file.originalname;
    cb(null, file_name);
    const email = req.user.email;
    filename_saving_in_db(file_name, email);
  },
});
const upload = multer({ storage: storage });

module.exports = upload;
