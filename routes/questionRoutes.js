const express = require('express')
const router = express.Router()
const questionsController = require('../controllers/questionsController')
// const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(questionsController.getAllQuestions)
    .post(questionsController.createNewQuestion)
    .patch(questionsController.updateQuestion)
    .delete(questionsController.deleteQuestion)

module.exports = router