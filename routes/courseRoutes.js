const express = require("express")
const router = express.Router()
const coursesController = require("../controllers/coursesController")
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route("/")
    .get(coursesController.getAllCourses)
    .post(coursesController.createNewCourse)
    .patch(coursesController.updateCourse)
    .delete(coursesController.deleteCourse)

module.exports = router;