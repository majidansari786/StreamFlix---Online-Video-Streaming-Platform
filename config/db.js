const mongoose = require('mongoose');
require('dotenv').config();

async function connectdb() {
  try{
    mongoose.connect(process.env.MONGO_DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    }); 
}catch(err){
    console.log('An error Occured: ',err);
  }
} 

module.exports = connectdb;