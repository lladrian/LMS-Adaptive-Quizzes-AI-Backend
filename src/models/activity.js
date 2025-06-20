import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  question: [
    {
      text: {
        type: String,
        required: false,
      },
      expected_output: {
        type: String,
        required: false,
      },
      options: {
        option_1: { type: String, required: false },
        option_2: { type: String, required: false },
        option_3: { type: String, required: false },
        option_4: { type: String, required: false },
      },
      correct_option: {
        type: String,
        required: false,
      },
      points: {
        type: Number,
        required: false,
      },
      answer_type: {
        type: String,
        enum: ["programming", "options"],
        required: true,
      },
    },
  ],
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "activity",
  },
  grading_breakdown: {
    type: String,
    default: "activity",
  },
  submission_time: {
    type: Number,
    required: true,
  },
  extended_minutes: {
    type: Number,
    default: 0, // Default to 0 minutes (no extension)
  },
  created_at: {
    type: String,
    default: null,
  },
});

export default mongoose.model("Activity", ActivitySchema);
