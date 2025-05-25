import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
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
  role: {
    type: String,
    default: "student"
  },
  joined_classroom: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Student', StudentSchema);