import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pic: {
    type: String,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invitation",
    required: true,
  },
  role: {
    type: String,
    enum: ['1', '2', '3'],
    default: '3',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profilePhoto: String, // URL to the profile photo

});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;