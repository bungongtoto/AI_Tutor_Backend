const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    examId: {
        type: String,
        required: true
    },
    structure: {
        type: "String",
        required: true
    },
    years:{
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "Paper"
    }
})

module.exports = mongoose.model('Course', courseSchema)