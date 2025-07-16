const mongoose = require('mongoose')

const todoschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    data: {
        type: String,
        required: true,  
    },
})

const todolist = new mongoose.model('todo',todoschema);

module.exports= todolist;