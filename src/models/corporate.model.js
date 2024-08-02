import mongoose from 'mongoose';

const CorporateRegistrationSchema = new mongoose.Schema({
  CorporateName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
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
  role: {
    type: String,
    enum: ['1', '2', '3'],
    default: '2',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  companySize: {
    type: String,
    enum: ['02 - 10', '11 - 50', '51 - 100', '101 - 1k', '1k - 5k', '5k - above'],
    default: '02 - 10',
  },
  profilePhoto: String, // URL to the profile photo
  address: String,
  pinCode: String,
});

const CorporateRegistration = mongoose.model('Corporate', CorporateRegistrationSchema);

export default CorporateRegistration;
