const express = require('express')
const router = express.Router()
const papersController = require('../controllers/papersController')
// const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(papersController.getAllPapers)
    .post(papersController.createNewPaper)
    .patch(papersController.updatePaper)
    .delete(papersController.deletePaper)

module.exports = router