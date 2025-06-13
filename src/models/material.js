import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom', // reference to the Instructor model
    required: true
  },
  question: [
    {
      text: {
        type: String,
        required: false
      },
      expected_output: {
        type: String,
        required: false
      },
      points: {
        type: Number,
        required: false
      },
      answer_type: {
        type: String,
        default: "programming"
      },
    }
  ],
  grading_breakdown: {
    type: String,
    default: "activity"
  },
  material: { 
    type: String, 
    required: true
  },
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
    default: "activity"
  },
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Material', MaterialSchema);