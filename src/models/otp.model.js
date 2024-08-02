import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true // Ensures only one OTP per email
  },
  otp: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: { expires: '5m' } // Expires in 5 minutes
  },
  signupData: {
    type: Object, 
    required: false // Temporarily store signup data
  }
});

export default mongoose.model('OTP', otpSchema);
