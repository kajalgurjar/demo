// src/utils/emailService.js
import transporter from '../db/nodemailer.config.js';

async function sendEmail(to, subject, text) {
    let mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: to,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error; // Optionally, rethrow the error if you want to handle it further up the chain
    }
}

export default sendEmail;
