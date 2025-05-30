import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  line_of_code: {
    type: String,
    required: false
  },
  points: {
    type: Number,
    default: 0
  },
  is_correct: {
    type: Number,
    default: 0
  }
});


const AnswerQuizSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz', // reference to the Instructor model
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // reference to the Instructor model
    required: true
  },
  answers: {
    type: [AnswerSchema],
    default: [] // ✅ default to empty array
  },
  opened_at: {
    type: String,
    default: null
  },
  submitted_at: {
    type: String,
    default: null
  },
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('AnswerQuiz', AnswerQuizSchema);