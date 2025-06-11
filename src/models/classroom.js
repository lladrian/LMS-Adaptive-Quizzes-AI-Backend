import mongoose from "mongoose";

const GradingSchema = new mongoose.Schema({
  quiz: {
    type: Number,
    default: 20
  },
  midterm: {
    type: Number,
    default: 30
  },
  final: {
    type: Number,
    default: 30
  },
  activity: {
    type: String,
    default: 20
  }
});

const ClassroomSchema = new mongoose.Schema({
  classroom_name: {
    type: String,
    required: true
  }, 
  subject_code: {
    type: String,
    required: true
  }, 
  description: {
    type: String,
    required: true
  }, 
  programming_language: {
    type: String,
    required: true
  }, 
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor', // reference to the Instructor model
    required: true
  },
  classroom_code: { 
    type: String, 
    required: true,
    unique: true
  },
  grading_system: {
    type: GradingSchema,
    default: {}
  },
  is_hidden: {
    type: Number,
    default: 0
  }, 
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Classroom', ClassroomSchema);