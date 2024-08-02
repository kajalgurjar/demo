// // import { Lead, CompanyLead, EmployeeLead } from '../models/lead.model.js';
// // import Reminder from '../models/reminder.model.js';

// // export async function addReminder(req, res) {
// //   try {
// //     const { leadId } = req.params;
// //     const { title, date, time } = req.body;

// //     // Check if leadId is valid
// //     const lead = await Lead.findById(leadId);
// //     if (!lead) {
// //       return res.status(404).json({ error: 'Lead not found' });
// //     }

// //     const datetime = new Date(`${date}T${time}:00Z`);

// //     // Create a new reminder
// //     const newReminder = new Reminder({
// //       title,
// //       leadId,
// //       date: datetime,
// //       time,
// //     });

// //     // Save the reminder to the database
// //     const savedReminder = await newReminder.save();

// //     res.status(200).json({ message: 'Reminder added successfully', reminder: savedReminder });
// //   } catch (error) {
// //     console.error('Error adding reminder:', error);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // }

// // export async function getRemindersByDateTime(req, res) {
// //   try {
// //     const { date, time } = req.query;

// //     // Construct exact datetime
// //     const datetime = new Date(`${date}T${time}:00Z`);

// //     // Find reminders at the exact date and time
// //     const reminders = await Reminder.find({
// //       date: datetime,
// //     }).exec();

// //     res.status(200).json(reminders);
// //   } catch (error) {
// //     console.error('Error fetching reminders:', error);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // }

// // controllers/reminder.controller.js
// import Reminder from "../models/reminder.model.js";

// export async function addReminder(req, res) {
//   const { message, dateTime, user } = req.body;
//   const newReminder = new Reminder({ message, dateTime, user });
//   await newReminder.save();
//   res.status(201).json(newReminder);
// }

// export async function getAllReminders(req, res) {
//   const reminders = await Reminder.find();
//   res.json(reminders);
// }

// src/controllers/addReminder.controller.js
import Reminder from "../models/reminder.model.js";

export async function addReminder(req, res) {
  try {
    const { message, dateTime, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const newReminder = new Reminder({ message, dateTime, user: userId });
    await newReminder.save();
    
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllReminders(req, res) {
  try {
    const userId = req.params.id; // Extract userId from URL parameters

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const reminders = await Reminder.find({ user: userId });
    reminders.reverse(); // Reverse the order of the reminders

    res.status(200).json({ reminders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
