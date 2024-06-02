const Paper = require("../models/Paper");
const Course = require("../models/Course");
const Question = require("../models/Question");
const asyncHandler = require("express-async-handler");

// @desc Get All paper
// @route GET /paper
// @access Private
const getAllPapers = asyncHandler(async (req, res) => {
  const papers = await Paper.find().lean();
  if (!papers?.length) {
    return res.status(400).json({ message: "No paper found" });
  }

  // Add coursetitle to each paper before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const paperWithCourses = await Promise.all(
    papers.map(async (paper) => {
      const course = await Course.findById(paper.courseId).lean().exec();
      return { ...paper, coursetitle: course.title };
    })
  );

  res.json(paperWithCourses);
});

// @desc Create new  paper
// @route POST /paper
// @access Private
const createNewPaper = asyncHandler(async (req, res) => {
  const {year, courseId , questions} = req.body;

  // Confirm Data
  if (!year || !courseId ) {
    return res.status(400).json({ message: "year and courseId fields required" });
  }

  // check for duplicates
  const duplicate = await Paper.findOne({ year })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate paper year" });
  }

  // create and store new paper
  let paper
  if (questions){
    paper = await Paper.create({ year, courseId , questions});
  } 
  else {
    paper = await Paper.create({ year, courseId });
  }
  

  if (paper) {
    res.status(201).json({ message: `New paper ${year} created` });
  } else {
    res.status(400).json({ message: "Invalid paper data received" });
  }
});

// @desc Update a paper
// @route PATCH /paper
// @access Private
const updatePaper = asyncHandler(async (req, res) => {
    const {id,year, courseId , questions} = req.body;

  // Confirm data
  if (!id || !year || !courseId || !questions) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const paper = await Paper.findById(id).exec();

  if (!paper) {
    return res.status(400).json({ message: "course not found" });
  }

  // check for duplicate
  const duplicate = await Paper.findOne({ year })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Paper" });
  }

  paper.year = year;
  paper.courseId = courseId;
  paper.questions = questions
  

  const updatedPaper = await paper.save();

  res.json({ message: `${updatedPaper.year} updated` });
});

// @desc delete a paper
// @route DELETE /paper
// @access Private
const deletePaper = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "paper ID required" });
  }

  // check for dependent questions
  const question = await Question.findOne({ paperId: id }).lean().exec();

  if (question) {
    return res.status(400).json({ message: "paper has assigned Question" });
  }

  const paper = await Paper.findById(id).exec();

  if (!paper) {
    return res.status(400).json({ message: "paper not found" });
  }

  const result = await paper.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `paper year ${paper.year} with ID ${paper._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllPapers,
  createNewPaper,
  updatePaper,
  deletePaper,
};
