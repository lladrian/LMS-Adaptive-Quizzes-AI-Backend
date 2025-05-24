import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
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
    default: "admin"
  },
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Admin', AdminSchema);