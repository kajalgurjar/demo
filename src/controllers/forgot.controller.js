import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Employee from '../models/employee.model.js';
import CorporateRegistration from '../models/corporate.model.js';
import User from '../models/user.model.js';
import transporter from '../db/nodemailer.config.js';
import express from 'express';

const router = express.Router();

export async function requestPasswordReset(req, res) {
  const { email } = req.body;
  let user, role;

  try {
    user = await Employee.findOne({ email });
    if (user) {
      role = '3'; // Employee role
    } else {
      user = await CorporateRegistration.findOne({ email });
      if (user) {
        role = '2'; // Corporate role
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USERNAME,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://localhost:5173/newPassword/${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Error sending email' });
      }
      res.status(200).json({ message: 'Password reset email sent' });
    });
  } catch (err) {
    console.error('Error requesting password reset:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function validateResetToken(req, res) {
  const token = req.params.token;
  let user;

  try {
    user = await Employee.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      user = await CorporateRegistration.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    res.status(200).json({ message: 'Token is valid, show password reset form.' });
  } catch (err) {
    console.error('Error validating reset token:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function resetPassword(req, res) {
  const token = req.params.token;
  const { password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  let user, role;

  try {
    // Find the user based on the token
    user = await Employee.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (user) {
      role = '3'; // Employee role
    } else {
      user = await CorporateRegistration.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (user) {
        role = '2'; // Corporate role
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Update password in the User table
    const userLogin = await User.findOne({ email: user.email });
    if (userLogin) {
      userLogin.password = await bcrypt.hash(password, 10);
      await userLogin.save();
    }
    
    res.status(200).json({ message: 'Password has been reset.' });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export default router;
