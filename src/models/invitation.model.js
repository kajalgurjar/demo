import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Fixed typo here
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'CorporateRegistration', required: true },
  token: { type: String, required: true, unique: true },
  status: { type: String, default: 'pending' }, // Status field
  createdAt: { type: Date, default: Date.now, expires: '1d' } // Token expires in 1 day
});

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
