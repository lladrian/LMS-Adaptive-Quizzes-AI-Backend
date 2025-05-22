import mongoose from "mongoose";

const LanguageSchema = new mongoose.Schema({
  language: {
    type: String, 
    required: true
  },
  version: { 
    type: String, 
    required: true
  },
  created_at: {
    type: String,
    default: null
  },
});


export default mongoose.model('Language', LanguageSchema);