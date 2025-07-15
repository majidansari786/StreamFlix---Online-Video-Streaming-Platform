const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URL)
.then(()=>console.log('Mongodb connected'))
.catch((err)=>console.log('Error Occured:',err));

const upload = require('../middleware/upload');

const upload_schema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    }
})

const upload_model = new mongoose.model('file_data',upload_schema);

module.exports = upload_model;