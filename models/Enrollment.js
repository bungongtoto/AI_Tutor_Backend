const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Enrollment', enrollmentSchema);