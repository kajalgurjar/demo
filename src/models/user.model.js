import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({ 
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
    userlogin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'role' // Dynamic reference based on userType
    },
    // userType: {
    //   type: String,
    //   required: true,
    //   enum: ['3', '2'] // Specifies the model to reference
    // },
  role: {
    type: String,
    enum: ['1', '2', '3'],
    required: true,
    default: '3',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const User = mongoose.model('user', userSchema);

export default User;