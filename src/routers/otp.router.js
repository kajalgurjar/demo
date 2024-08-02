// // src/routes/otp.js
// import express from 'express';
// import generateOTP from '../utils/otpGenerator.js';
// import sendEmail from '../utils/emailService.js';
// import OTP from '../models/otp.model.js';

// const router = express.Router();

// // Endpoint to request or resend OTP
// router.post('/request-otp', async (req, res) => {
//     const { email } = req.body; // Email for sending OTP

//     const otp = generateOTP(); // Generate a new OTP

//     // Check if there's an existing OTP record for this email
//     const existingOtp = await OTP.findOneAndUpdate(
//         { email }, // Query
//         { otp, createdAt: Date.now() }, // Update with new OTP and reset createdAt
//         { new: true, upsert: true } // `new: true` returns the updated document, `upsert: true` creates a new document if none exists
//     );

//     // Send the new OTP via email
//     await sendEmail(email, 'Your OTP', `Your OTP is ${otp}`);

//     // Respond with the OTP in the response body
//     const message = existingOtp ? 'OTP resent to your email' : 'OTP sent to your email';
//     res.json({ message, otp }); // Send the OTP in the response
// });

// // Endpoint to verify OTP
// router.post('/verify-otp', async (req, res) => {
//     const { email, otp } = req.body;

//     const validOtp = await OTP.findOne({ email, otp });

//     if (validOtp) {
//         res.send('OTP verified');
//     } else {
//         res.status(400).send('Invalid OTP');
//     }
// });

// export default router;
