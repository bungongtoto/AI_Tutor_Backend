const mongoose = require('mongoose')

const paperSchema = new mongoose.Schema({
    year: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    questions:{
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "Question"
    }
})

module.exports = mongoose.model('Paper', paperSchema)