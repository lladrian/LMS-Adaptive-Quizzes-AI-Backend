import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam', // reference to the Instructor model
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // reference to the Instructor model
    required: true
  },
  line_of_code: { 
    type: String, 
    required: false
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


export default mongoose.model('Answer', AnswerSchema);