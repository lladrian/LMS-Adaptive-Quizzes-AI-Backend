import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  }, 
  student_id_number: {
    type: Number,
    required: true,
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
  status: {
    type: String,
    default: "unverified"
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