import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom', // reference to the Instructor model
    required: true
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
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Material', MaterialSchema);