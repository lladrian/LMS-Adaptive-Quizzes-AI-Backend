import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: false,
  },
  line_of_code: {
    type: String,
    required: false,
  },
  selected_option: {
    type: String,
    required: false,
  },
  points: {
    type: Number,
    default: 0,
  },
  is_correct: {
    type: Number,
    default: 0,
  },
});

const AnswerAssignmentSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment", // reference to the Assignment model
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // reference to the Student model
    required: true,
  },
  answers: {
    type: [AnswerSchema],
    default: [],
  },
  opened_at: {
    type: String,
    default: null,
  },
  submitted_at: {
    type: String,
    default: null,
  },
  created_at: {
    type: String,
    default: null,
  },
});

export default mongoose.model("AnswerAssignment", AnswerAssignmentSchema);
