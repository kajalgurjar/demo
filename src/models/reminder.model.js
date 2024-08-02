// import mongoose from "mongoose";

// const reminderSchema = new mongoose.Schema({
//   message: { type: String, required: true },
//   dateTime: { type: Date, required: true },
//   user: String,
//   notified: { type: Boolean, default: false },
// });

// const Reminder = mongoose.model("Reminder", reminderSchema);

// export default Reminder;

// src/models/reminder.model.js
import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  message: { type: String, required: true },
  dateTime: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notified: { type: Boolean, default: false },
});

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
