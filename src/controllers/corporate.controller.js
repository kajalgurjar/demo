// corporateRegistration.controller.js
import { compare } from 'bcrypt';
import corporateRegistrationModel from '../models/corporate.model.js';
import { genSalt, hash } from 'bcrypt';
import ApiError from '../utils/ApiError.js';
const { sign } = jwt;
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import generateOTP from '../utils/otpGenerator.js';
import sendEmail from '../utils/emailService.js';
import OTP from '../models/otp.model.js';

export async function signup(req, res) {
  const { CorporateName, name, number, email, password, role } = req.body;

  try {
    // Check if the company already exists
    let company = await corporateRegistrationModel.findOne({ email });
    if (company) {
      return res.status(400).json({ error: 'Company already exists' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in the database with the email
    const otpRecord = new OTP({ email, otp });
    await otpRecord.save();

    // Send OTP via email
    await sendEmail(email, otp);

    // Store the signup data temporarily
    // You could use a separate collection for this or handle it in another way
    // For simplicity, I'm storing it in the OTP collection
    otpRecord.signupData = { CorporateName, name, number, email, password, role };
    await otpRecord.save();

    res.status(200).json({ message: 'OTP sent to your email. Please verify to complete the registration.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function verifyOTP(req, res) {
  const { otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ otp });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const { CorporateName, name, number, email, password, role } = otpRecord.signupData;

    // Hash password before saving
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    // Create a new company registration instance
    const company = new corporateRegistrationModel({
      CorporateName,
      name,
      number,
      email,
      password: hashedPassword,
      role
    });

    // Save the company registration details
    await company.save();

    const newUser = new User({
      email,
      password: hashedPassword,
      userlogin: company._id,
      role: company.role
    });
    await newUser.save();

    // Remove OTP after successful verification and registration
    await OTP.deleteOne({ otp });

    res.status(201).json({ message: 'Company registered successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function logout(req, res) {
  try {
    // Clear the token from client-side storage (cookies, localStorage, etc.)
    res.clearCookie('token');
    
    // Respond with success message
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Error during logout:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getCorporateById(req, res) {
  const { id } = req.params;

  try {
    // Find the company by ID
    const company = await corporateRegistrationModel.findById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Respond with the company details
    res.status(200).json(company);
  } catch (err) {
    console.error('Error retrieving company by ID:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateProfile(req, res) {
  const { id } = req.params;
  const { CorporateName, name, companySize, address, pinCode } = req.body;
  const profilePhoto = req.file;
  const profile = req.file ? `/uploads/${profilePhoto.filename}` : null;
  try {
    // Validate ID format
    if (!id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Find the company by ID
    let company = await corporateRegistrationModel.findById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Update only the provided company details
    if (CorporateName !== undefined) company.CorporateName = CorporateName;
    if (name !== undefined) company.name = name;
    if (profile) company.profilePhoto = `/uploads/${profilePhoto.filename}`;
    if (companySize !== undefined) company.companySize = companySize;
    if (address !== undefined) company.address = address;
    if (pinCode !== undefined) company.pinCode = pinCode;

    // Save the updated company details
    await company.save();

    // Respond with success message
    res.status(200).json({ message: 'Profile updated successfully', company });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}
