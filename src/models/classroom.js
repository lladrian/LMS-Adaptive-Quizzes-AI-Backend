// models/classroom.js
import mongoose from "mongoose";

const GradingSchema = new mongoose.Schema({
  quiz: {
    type: Number,
    default: 20,
  },
  midterm: {
    type: Number,
    default: 30,
  },
  final: {
    type: Number,
    default: 30,
  },
  activity: {
    type: Number,
    default: 20,
  },
});

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
    enum: ["lessons", "assignments", "grades", "practice"], // Optional validation
  },
  created_at: {
    type: String,
    default: null,
  },
});

export default mongoose.model("Classroom", ClassroomSchema);
