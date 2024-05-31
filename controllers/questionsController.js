const Question = require("../models/question");
const Paper = require("../models/Paper");
const asyncHandler = require("express-async-handler");

// @desc Get All questions
// @route GET /questions
// @access Private
const getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find().lean();
  if (!questions?.length) {
    return res.status(400).json({ message: "No questions found" });
  }

  // Add coursetitle to each question before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const questionWithPaper = await Promise.all(
    questions.map(async (question) => {
      const paper = await Paper.findById(question.paperId).lean().exec();
      return { ...question, paperyear: paper.year };
    })
  );

  res.json(questionWithPaper);
});

// @desc Create new  question
// @route POST /question
// @access Private
const createNewQuestion = asyncHandler(async (req, res) => {
  const {number, paperId, text, answer } = req.body;

  // Confirm Data
  if (!number || !paperId || !text || !answer ) {
    return res.status(400).json({ message: "All fields required" });
  }

  // check for duplicates
  const duplicate = await Question.findOne({ number })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate question number" });
  }

  // create and store new question
  const question =  await Question.create({ number, paperId, text, answer});
  
  

  if (question) {
    res.status(201).json({ message: `New question ${number} created` });
  } else {
    res.status(400).json({ message: "Invalid question data received" });
  }
});

// @desc Update a question
// @route PATCH /question
// @access Private
const updateQuestion = asyncHandler(async (req, res) => {
    const {id,number, paperId, text, answer} = req.body;

  // Confirm data
  if (!id ||!number || !paperId || !text || !answer) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const question = await question.findById(id).exec();

  if (!question) {
    return res.status(400).json({ message: "question not found" });
  }

  // check for duplicate
  const duplicate = await question.findOne({ number })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate question" });
  }

  question.number = number;
  question.paperId = paperId;
  question.text = text;
  question.answer = answer;
  

  const updatedquestion = await question.save();

  res.json({ message: `${updatedquestion.number} updated` });
});

// @desc delete a question
// @route DELETE /question
// @access Private
const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "question ID required" });
  }

  
  const question = await Question.findById(id).exec();

  if (!question) {
    return res.status(400).json({ message: "question not found" });
  }

  const result = await question.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `question number ${question.number} with ID ${question._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllQuestions,
  createNewQuestion,
  updateQuestion,
  deleteQuestion,
};
