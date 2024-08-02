import mongoose from 'mongoose';
import Corporate  from '../models/corporate.model.js'; // Adjust the import paths as needed
import Employee from '../models/employee.model.js'; // Adjust the import paths as needed

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
});

// Static method to get user name
logSchema.statics.getUserName = async function(userId) {
  let user = await Corporate.findById(userId);
  if (user) {
    return user.name;
  }

  user = await Employee.findById(userId);
  if (user) {
    return user.name;
  }

  throw new Error('User not found');
};

const Log = mongoose.model('Log', logSchema);

export { Log };
