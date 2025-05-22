import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom', // reference to the Instructor model
    required: true
  },
  instruction: { 
    type: String, 
    required: true
  },
  submission_time: { 
    type: String, 
    required: true
  },
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Exam', ExamSchema);