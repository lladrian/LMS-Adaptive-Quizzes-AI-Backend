import mongoose from "mongoose";
 

const QuizSchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom', // reference to the Instructor model
    required: true
  },
  question: [
    {
      text: {
        type: String,
        required: true
      },
      expected_output: {
        type: String,
        required: true
      },
      points: {
        type: Number,
        required: true
      }
    }
  ],
  description: { 
    type: String, 
    required: true
  },
  title: { 
    type: String, 
    required: true
  },
  type: {
    type: String,
    default: "quiz"
  },
    grading_breakdown: {
    default: "quiz"
  },
  submission_time: { 
    type: Number, 
    required: true
  },
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Quiz', QuizSchema);