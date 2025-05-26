import mongoose from "mongoose";

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