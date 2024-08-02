import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
  },
  assignedTo: [
    {
      // Changed to an array of ObjectId references
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  ],
  assignedToName:
  [ { type: [String],
     required: true
    },
  ],
  createDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "In Conversation", "In Progress", "Win", "Lost"],
    default: "Pending",
  },
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Corporate",
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "role", // Use refPath for polymorphic reference
  },
  role: {
    type: String,
    enum: ["3", "2"],
    required: true,
  },
  comments: {
    type: [String],
    required: true,
  },
});

const Lead = mongoose.model("Lead", leadSchema);

export { Lead };
