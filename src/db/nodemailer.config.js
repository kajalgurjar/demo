// src/config/nodemailer.js
import { createTransport } from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export default transporter;
