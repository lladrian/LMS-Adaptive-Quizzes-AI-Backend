import mongoose from "mongoose";

const InstructorSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  }, 
  password: { 
    type: String, 
    required: true,
  },
  email: { 
    type: String, 
    required: true,
    unique: true
  },
  status: {
    type: String,
    default: "unverified"
  },
  role: {
    type: String,
    default: "instructor"
  },
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Instructor', InstructorSchema);