import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "./db/db.config.js";
import sendEmail from "./db/nodemailer.config.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import multer from "multer";

// Load environment variables
dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173/", // Replace with your client URL
    methods: ["GET", "POST"],
  },
});

// import otpRouter from './routers/otp.router.js';

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes import
import corporateRouter from './routers/corporate.router.js'; 
import employeeRouter from './routers/employee.router.js'; 
import changePasswordRouter from './routers/settings.router.js';
import leadRouter from './routers/lead.router.js';
import passwordResetRouter from './routers/forgot.router.js';
import commentRouter from './routers/comment.router.js'
import statusRouter from './routers/status.router.js'
import loginRouter from './routers/login.router.js'
import reminderRouter from './routers/reminder.routes.js'
import profilemanagementRouter from './routers/profilemanagemant.router.js'
import logRouter from "./routers/log.routes.js"
// Routes declaration
app.use("/api/v1/corporate", corporateRouter);
app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/settings", changePasswordRouter);
app.use("/api/v1/leads", leadRouter);
app.use("/api/v1/password-forgot", passwordResetRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/status", statusRouter);
app.use("/api/v1/login", loginRouter);
app.use("/api/v1/profilemanagement", profilemanagementRouter);
app.use("/api/v1/status", statusRouter);
app.use("/api/v1/reminder", reminderRouter);
app.use("/api/v1/log", logRouter);

// app.use('/otp', otpRouter);

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/send-email", (req, res) => {
  // Example usage of sendEmail function
  sendEmail(
    "recipient@example.com",
    "Test Subject",
    "Test email body",
    "<b>Test email body</b>"
  );
  res.send("Email sent!");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Import Reminder model
import Reminder from "./models/reminder.model.js";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const reminders = await Reminder.find({
    dateTime: { $lte: now },
    notified: { $ne: true },
  });
  reminders.forEach((reminder) => {
    // Emit the notification to all connected clients
    io.emit("reminderNotification", {
      message: reminder.message,
      user: reminder.user,
    });
    // Update the reminder to marked as notified
    reminder.notified = true;
    reminder.save();
  });
});

export { app, io };
