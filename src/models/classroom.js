import mongoose from "mongoose";

const TermGradingSchema = new mongoose.Schema(
  {
    components: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { _id: false }
);

const GradingSchema = new mongoose.Schema(
  {
    midterm: {
      type: TermGradingSchema,
      default: () => ({ components: {} }),
    },
    final: {
      type: TermGradingSchema,
      default: () => ({ components: {} }),
    },
  },
  { _id: false }
);

const ClassroomSchema = new mongoose.Schema({
  classroom_name: {
    type: String,
    required: true,
  },
  subject_code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  programming_language: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },
  classroom_code: {
    type: String,
    required: true,
    unique: true,
  },
  grading_system: {
    // Changed from grading_system to grading_system
    type: GradingSchema,
    default: () => ({}),
  },
  is_hidden: {
    type: Number,
    default: 0,
  },
  restricted_sections: {
    type: [String],
    default: [],
    enum: [
      "lessons",
      "assignments",
      "grades",
      "practice",
      "students",
      "materials",
      "activities",
    ],
  },
  created_at: {
    type: String,
    default: null,
  },
});

export default mongoose.model("Classroom", ClassroomSchema);
