const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Exam"
    },
    structure: {
        type: "String",
        required: true
    },
    years:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Course', courseSchema)