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

const AnswerActivitySchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity", // reference to the Activity model
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

export default mongoose.model("AnswerActivity", AnswerActivitySchema);
