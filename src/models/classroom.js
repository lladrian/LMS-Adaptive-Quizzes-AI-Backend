import mongoose from "mongoose";

const TermGradingSchema = new mongoose.Schema(
  {
    quiz: {
      type: Number,
      default: 15,
    },
    exam: {
      type: Number,
      default: 50,
    },
    activity: {
      type: Number,
      default: 20,
    },
    assignment: {
      type: Number,
      default: 15,
    },
  },
  { _id: false }
); // Prevent creating IDs for subdocuments

const GradingSchema = new mongoose.Schema(
  {
    midterm: {
      type: TermGradingSchema,
      default: () => ({
        quiz: 15,
        exam: 50,
        activity: 20,
        assignment: 15,
      }),
    },
    final: {
      type: TermGradingSchema,
      default: () => ({
        quiz: 15,
        exam: 50,
        activity: 20,
        assignment: 15,
      }),
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
