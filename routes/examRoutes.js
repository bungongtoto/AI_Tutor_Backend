const express = require('express')
const router = express.Router()
const examsController = require('../controllers/examsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(examsController.getAllExams)
    .post(examsController.createNewExam)
    .patch(examsController.updateExam)
    .delete(examsController.deleteExam)

module.exports = router