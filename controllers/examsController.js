const Exam = require("../models/Exam");
const Course = require("../models/Course");
const asyncHandler = require("express-async-handler");

// @desc Get All exams
// @route GET /exams
// @access Private
const getAllExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().lean();
  if (!exams?.length) {
    return res.status(400).json({ message: "No exams found" });
  }

  res.json(exams);
});

// @desc Create new  exam
// @route POST /exam
// @access Private
const createNewExam = asyncHandler(async (req, res) => {
  const { title, courses } = req.body;

  // Confirm Data
  if (!title) {
    return res.status(400).json({ message: "title field required" });
  }

  // check for duplicates
  const duplicate = await Exam.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate exam Title" });
  }

  // create and store new exam
  let exam;
  if (courses) {
    exam = await exam.create({ title });
  } else {
    exam = await exam.create({ title, courses });
  }

  if (exam) {
    res.status(201).json({ message: `New exam ${title} created` });
  } else {
    res.status(400).json({ message: "Invalid exam data received" });
  }
});

// @desc Update a exam
// @route PATCH /exam
// @access Private
const updateExam = asyncHandler(async (req, res) => {
  const { id, title, courses } = req.body;

  // Confirm data
  if (!id || !title || !courses) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exam = await Exam.findById(id).exec();

  if (!exam) {
    return res.status(400).json({ message: "exam not found" });
  }

  // check for duplicate
  const duplicate = await Exam.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate exam" });
  }

  exam.title = title;
  exam.courses = courses;

  const updatedexam = await exam.save();

  res.json({ message: `${updatedexam.title} updated` });
});

// @desc delete a exam
// @route DELETE /exam
// @access Private
const deleteExam = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "exam ID required" });
  }

  // check for dependent Courses
  const course = await Course.findOne({ examId: id }).lean().exec();

  if (course) {
    return res.status(400).json({ message: "Exam has assigned courses" });
  }
  
  const exam = await Exam.findById(id).exec();

  if (!exam) {
    return res.status(400).json({ message: "exam not found" });
  }

  
  const result = await exam.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `exam title ${exam.title} with ID ${exam._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllExams,
  createNewExam,
  updateExam,
  deleteExam,
};
