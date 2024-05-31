const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    paperId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('Question', questionSchema)