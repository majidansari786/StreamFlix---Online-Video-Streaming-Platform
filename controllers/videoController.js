const path = require('path')
const fs = require('fs')
require('dotenv').config();
const { exec } = require('child_process');


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
    try{
      const { output_name, selected_option } = req.body;
      const dirPath = path.join(__dirname, '../public/upload', output_name);
    //   if(!fs.existsSync(dirPath)){
    //     fs.mkdirSync(dirPath,{recursive: true});
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
  catch(error){
    console.log("An error Occured: ",error);
  }
  }

  module.exports = {
    reso_video_encode,
    encode,
    compress_video_encode
  }