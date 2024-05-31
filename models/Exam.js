const mongoose = require('mongoose')

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    courses:{
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "Course"
    }
})

module.exports = mongoose.model('Exam', examSchema)