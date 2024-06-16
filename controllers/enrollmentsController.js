const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Exam = require("../models/Exam");
const Paper = require("../models/Paper");
const asyncHandler = require("express-async-handler");

// @desc Get All enrollments
// @route GET /enrollments
// @access Private
const getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find().lean();
  if (!enrollments?.length) {
    return res.status(400).json({ message: "No enrollments found" });
  }

  res.json(enrollments);
});

// @desc Create new  enrollment
// @route POST /enrollment
// @access Private
const createNewEnrollment = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.body;

  // Confirm Data
  if (!userId || !courseId) {
    return res.status(400).json({ message: "all fields required" });
  }

  // check for duplicates
  const duplicate1 = await Enrollment.findOne({ userId })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  const duplicate2 = await Enrollment.findOne({ courseId })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate1 && duplicate2) {
    return res.status(409).json({ message: "Already Enrolled to the course" });
  }

  // create and store new enrollment
  const enrollment = await  Enrollment.create({ userId, courseId });

  if (enrollment) {
    res.status(201).json({ message: `New enrollment by userId:  ${userId} for courseId ${courseId}` });
  } else {
    res.status(400).json({ message: "Invalid enrollment data received" });
  }
});

// @desc Update an enrollment 
// @route PATCH /enrollment
// @access Private
const updateEnrollment = asyncHandler(async (req, res) => {
  const { id, userId, courseId, active } = req.body;

  // Confirm data
  if (!id || !userId || !courseId || !active ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const enrollment = await Enrollment.findById(id).exec();

  if (!enrollment) {
    return res.status(400).json({ message: "enrollment not found" });
  }

  enrollment.userId = userId;
  enrollment.courseId = courseId;
  enrollment.active = active;

  const updatedenrollment = await enrollment.save();

  res.json({ message: `${updatedenrollment._id} updated` });
});

// @desc delete a enrollment
// @route DELETE /enrollment
// @access Private
const deleteEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "enrollment ID required" });
  }

  const enrollment = await Enrollment.findById(id).exec();

  if (!enrollment) {
    return res.status(400).json({ message: "enrollment not found" });
  }

  const result = await enrollment.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `enrollment title ${enrollment._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllEnrollments,
  createNewEnrollment,
  updateEnrollment,
  deleteEnrollment,
};
