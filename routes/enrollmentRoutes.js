const express = require('express')
const router = express.Router()
const enrollmentsController = require('../controllers/enrollmentsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(enrollmentsController.getAllEnrollments)
    .post(enrollmentsController.createNewEnrollment)
    .patch(enrollmentsController.updateEnrollment)
    .delete(enrollmentsController.deleteEnrollment)

module.exports = router