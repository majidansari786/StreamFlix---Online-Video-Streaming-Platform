const path = require('path')
const fs = require('fs')
const User = require('../model/user');
const todomodel = require('../model/todo');
const { render } = require('ejs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { exec } = require('child_process');

const dashboardController = (req,res)=>{
  res.render('../views/dashboard.ejs')
}

const getuser = (req, res) => {
  res.render('../views/index.ejs')
  }

async function deleteuser(req,res) {
  try{
    const { email } = req.body;
    if(!email){
      res.status(400).json({error:"email is required"})
    }
    const findemail = await User.findOne({email})
    if(!findemail){
      res.status(400).json({error:"user not found"})
    }
    if(email){
      await User.deleteOne({email: email});
      res.status(201).json({success:"User deleted Successfully"})
      console.log(`User ${email} deleted successfully`)
    }
  }catch(error){
    res.status(500).json({error:'Internal server error'})
    console.log('error occured', error);
  }
}

const getuserbyid = (req, res) => {
  const id = Number(req.params.id);
  res.send(`About user ${id}`);
}


async function handleUserSignup(req, res) {
  const { first_name, last_name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstname: first_name,
    lastname: last_name,
    email,
    password: hash,
  });

  newUser.save()
    .then(user => {
      console.log('User saved:', user);
      res.status(201).json({ message: 'User created successfully', user });
    })
    .catch(err => {
      console.error('Validation error:', err);
      res.status(400).json({ error: err.message });
    });
}

async function handleUserLogin(req,res) {
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    res.json({error: "User not found"});
  }
  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.json({error:'invalid credentials'})
  const payload = {id:user._id, email:user.email};
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn:'1h'})
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, {expiresIn:'7d'})
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie(
    'userAcesstoken',accessToken,
    {httpOnly: true,
    secure: false,
    sameSite: 'Strict',
    maxAge: 24 * 60 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, { 
    httpOnly: true,
    secure: true, 
    sameSite: 'Strict', 
    maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.redirect('/user');
    }

async function logout(req,res) {
  res.clearCookie('jwt');
  res.json({message:"Logout successfully"})
}

// async function refresh(req, res) {
//   const token = req.cookies.refreshToken;
//   if (!token) return res.sendStatus(401).json({error:'Token not exist'});

//   const user = await User.findOne({ refreshToken: token });
//   if (!user) return res.sendStatus(403).json({error:'user not exist'});

//   jwt.verify(token, process.env.REFRESH_TOKEN, (err, decoded) => {
//     if (err) return res.sendStatus(403);
//     const payload = {id:user._id, email:user.email};
//     const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn:'1h'});
//     res.cookie('userAcesstoken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
//     res.json({ message: 'Access token refreshed' });
//   });
// }

async function todo(req,res) {
  const {todo_data} = req.body;
  const refreshToken = req.cookies.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if(!todo_data) return res.json({error:"no todo data"});
  const email = user.email;
  const newdata = new todomodel({
    email: email,
    data: todo_data
  })
  newdata.save()
    .then(user => {
      console.log('Todo saved');
      res.status(201).json({ message: 'Todo created successfully' });
    })
    .catch(err => {
      console.error('Validation error:', err);
      res.status(400).json({ error: err.message });
    });
}

async function reso_video_encode(inputfile,output_name,scale,res){
  const command = `ffmpeg -i "${inputfile}" -vf scale=-2:"${scale}" -c:v libx264 -crf 23 -preset fast -c:a copy -f hls -hls_time 4 -hls_list_size 0 -hls_segment_filename "${output_name}"_%03d.ts "${output_name}".m3u8`
  try{
    res.json({success:"Encoding Started",output:output_name}).status(201)
    exec(command,(error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.error(`stderr: ${stderr}`);
  console.log(`Encoding Done: ${output_name}`)
});
  }
  catch(error){
    console.log('An error occured',error);
  }
}

async function compress_video_encode(inputfile,output_name,res) {
  if (!output_name.endsWith('.mp4')) {
      output_name += '.mp4';
    }
  const command_compress = `ffmpeg -i "${inputfile}" -vcodec libx265 -crf 30 -preset fast -tag:v hvc1 -acodec aac -b:a 128k "${output_name}"`;
  try{
    res.json({success:"Encoding Started",output:output_name}).status(201)
    exec(command_compress,(error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`Encoding Done: ${output_name}`);
});
  }
  catch(error){
    console.log('An error occured',error);
  }
}

async function encode(req,res){
    const { output_name, selected_option } = req.body;
    const dirPath = path.join(__dirname, '../public/upload', output_name);
    // if(!fs.existsSync(dirPath)){
    //   fs.mkdirSync(dirPath,{recursive: true});
    // }
    const upload_folder = path.join(__dirname,'../public/upload');
    let safeOutputName = path.basename(output_name).replace(/[^a-zA-Z0-9_\-\.]/g, '');
    // if (!safeOutputName.endsWith('.mp4')) {
    //   safeOutputName += '.mp4';
    // }
    const inputPath = path.join(__dirname, 'music.mp4');
    const outputPath = path.join(__dirname, `../public/upload/${output_name}` ,safeOutputName);
    switch(selected_option){
    case "0":
      compress_video_encode(inputPath,outputPath,res);
        break;
    case "1":
      reso_video_encode(inputPath,outputPath,480,res);
        break;
    case "2":
      reso_video_encode(inputPath,outputPath,720,res);
        break;
    case "3":
      reso_video_encode(inputPath,outputPath,1080,res);
        break;
    }
  }

  async function handleUpload(req,res) {
    res.json({ message: 'File uploaded successfully!' });
  }

module.exports = {
    deleteuser,
    getuser,
    getuserbyid,
    handleUserSignup,
    handleUserLogin,
    encode,
    logout,
    // refresh,
    handleUpload,
    todo,
    dashboardController,
};