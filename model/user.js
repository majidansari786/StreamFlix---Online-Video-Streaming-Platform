const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URL)
.then(()=>console.log('Mongodb connected'))
.catch((err)=>console.log('Error Occured:',err));

const userschema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user',
    },
}
)

const User = new mongoose.model('users',userschema)

module.exports = User;