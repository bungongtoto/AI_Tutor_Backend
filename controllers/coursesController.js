const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Exam = require("../models/Exam");
const Paper = require("../models/Paper");
const asyncHandler = require("express-async-handler");

// @desc Get All courses
// @route GET /courses
// @access Private
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().lean();
  if (!courses?.length) {
    return res.status(400).json({ message: "No courses found" });
  }

  // Add examtitle to each course before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const coursesWithExams = await Promise.all(
    courses.map(async (course) => {
      const exam = await Exam.findById(course.examId).lean().exec();
      return { ...course, examtitle: exam.title };
    })
  );

  res.json(coursesWithExams);
});

// @desc Create new  course
// @route POST /course
// @access Private
const createNewCourse = asyncHandler(async (req, res) => {
  const {title , examId ,structure , years} = req.body;

  // Confirm Data
  if (!title || !structure || !examId || !years ) {
    return res.status(400).json({ message: "all fields required" });
  }

  // check for duplicates
  const duplicate = await Course.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate course Title" });
  }

  // create and store new course
  const  course = await Course.create({ title, examId ,structure, years});
  

  if (course) {
    res.status(201).json({ message: `New course ${title} created` });
  } else {
    res.status(400).json({ message: "Invalid course data received" });
  }
});

// @desc Update a course
// @route PATCH /course
// @access Private
const updateCourse = asyncHandler(async (req, res) => {
    const {id, title , examId ,structure, years} = req.body;

  // Confirm data
  if (!id || !title || !structure || !years || !examId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const course = await Course.findById(id).exec();

  if (!course) {
    return res.status(400).json({ message: "course not found" });
  }

  // check for duplicate
  const duplicate = await Course.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate course" });
  }

  course.title = title;
  course.examId = examId;
  course.structure = structure;
  course.years = years;
  

  const updatedcourse = await course.save();

  res.json({ message: `${updatedcourse.title} updated` });
});

// @desc delete a course
// @route DELETE /course
// @access Private
const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "course ID required" });
  }

  // check for dependent Papers
  const paper = await Paper.findOne({ courseId: id }).lean().exec();

  if (paper) {
    return res.status(400).json({ message: "Course has assigned papers" });
  }

  // check for dependent Enrollments
  const enrollment = await Enrollment.findOne({ courseId: id }).lean().exec();

  if (enrollment) {
    return res.status(400).json({ message: "Course has assigned enrollments" });
  }
  
  const course = await Course.findById(id).exec();

  if (!course) {
    return res.status(400).json({ message: "course not found" });
  }

  const result = await course.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `course title ${course.title} with ID ${course._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllCourses,
  createNewCourse,
  updateCourse,
  deleteCourse,
};
