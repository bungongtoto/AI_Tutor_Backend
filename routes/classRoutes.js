const express = require("express");
const router = express.Router();
const classesController = require("../controllers/classesController")
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(classesController.getAllClasses)
    .post(classesController.createNewClass)
    .patch(classesController.updateClass)
    .delete(classesController.deleteClass)

module.exports = router