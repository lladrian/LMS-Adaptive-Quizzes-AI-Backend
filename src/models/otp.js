import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  otp_code: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'user_type'
  },
  user_type: {
    type: String,
    enum: ['Student', 'Instructor', 'Admin'],
    required: true
  },
  created_at: {
    type: String,
    default: null
  },
});

export default mongoose.model('OTP', OTPSchema);
