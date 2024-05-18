const express = require("express");
const router = express.Router();
const sectionsController = require('../controllers/sectionsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route("/")
    .get(sectionsController.getAllSections)
    .post(sectionsController.createNewSection)
    .patch(sectionsController.updateSection)
    .delete(sectionsController.deleteSection)

module.exports = router;
