import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Employee from '../models/employee.model.js';
import CorporateRegistration from '../models/corporate.model.js';
import Invitation from '../models/invitation.model.js';
import User from '../models/user.model.js';
import sendEmail from '../db/nodemailer.config.js'
import multer from 'multer';
const upload = multer();
const { sign } = jwt;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send Employee Invitation Function
// export async function sendEmployeeInvitation(req, res) {
//   const { email, companyId } = req.body;

//   try {
//     // Check if the company exists
//     let company = await CorporateRegistration.findById(companyId);
//     if (!company) {
//       return res.status(404).json({ error: 'Company not found' });
//     }

//     // Generate a unique token
//     const token = crypto.randomBytes(20).toString('hex');

//     // Save the invitation token to the database
//     const invitation = new Invitation({ email, company: company._id, token, status: 'pending' });
//     await invitation.save();

//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     console.log('FRONTEND_URL:', frontendUrl); // Debugging line to check FRONTEND_URL

//     // Construct the URL with the token
//     const registrationUrl = `${frontendUrl}registerEmployee/${token}`;
//     console.log('Registration URL:', registrationUrl); // Debugging line to check the constructed URL
    
//     // Send the invitation email
//     const mailOptions = {
//       from: process.env.EMAIL_USERNAME,
//       to: email,
//       subject: 'You are invited to join our platform',
//       text: `You are invited to join our platform. Click the link below to complete your registration: \n\n${registrationUrl}`
//     };

//     transporter.sendMail(mailOptions, (error, _info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//         return res.status(500).json({ error: 'Error sending email' });
//       } else {
//         res.status(200).json({ message: 'Invitation sent successfully.' });
//       }
//     });
//   } catch (err) {
//     console.error('Error during sending invitation:', err.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// }

export async function sendEmployeeInvitation(req, res) {
  const { email, companyId } = req.body;
  
  try {
    // Check if the company exists
    const company = await CorporateRegistration.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if the email is already registered as an employee
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'This email is already registered as an employee. Invitation cannot be sent.' });
    }

    // Check if an invitation already exists
    const existingInvitation = await Invitation.findOne({ email, company: company._id });

    if (existingInvitation) {
      return res.status(400).json({ message: 'An invitation has already been sent to this email address. Please use the resend function if needed.' });
    } else {
      // If no invitation exists, create a new one
      const token = crypto.randomBytes(20).toString('hex');
      const newInvitation = new Invitation({ email, company: company._id, token, status: 'pending' });
      await newInvitation.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log('FRONTEND_URL:', frontendUrl); // Debugging line to check FRONTEND_URL

      // Construct the URL with the token
      const registrationUrl = `${frontendUrl}registerEmployee/${token}/emailId/${email}`;
      console.log('Registration URL:', registrationUrl); // Debugging line to check the constructed URL

      // Send the invitation email
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'You are invited to join our platform',
        text: `You are invited to join our platform. Click the link below to complete your registration: \n\n${registrationUrl}`
      };

      transporter.sendMail(mailOptions, (error, _info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Error sending email' });
        } else {
          res.status(200).json({ message: 'Invitation sent successfully.' });
        }
      });
    }
  } catch (err) {
    console.error('Error during sending invitation:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function resendEmployeeInvitation(req, res) {
  const { email, companyId } = req.body;

  try {
    // Check if the company exists
    const company = await CorporateRegistration.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if an invitation already exists
    const invitation = await Invitation.findOne({ email, company: company._id });

    if (!invitation) {
      return res.status(404).json({ error: 'No existing invitation found for this email address.' });
    }

    // Update the token and status
    invitation.token = crypto.randomBytes(20).toString('hex');
    invitation.status = 'pending';
    await invitation.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log('FRONTEND_URL:', frontendUrl); // Debugging line to check FRONTEND_URL

    // Construct the URL with the token
    const registrationUrl = `${frontendUrl}registerEmployee/${invitation.token}/emailId/${email}`;
    console.log('Registration URL:', registrationUrl); // Debugging line to check the constructed URL

    // Send the invitation email
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'You are invited to join our platform',
      text: `You are invited to join our platform. Click the link below to complete your registration: \n\n${registrationUrl}`
    };

    transporter.sendMail(mailOptions, (error, _info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email' });
      } else {
        res.status(200).json({ message: 'Invitation resent successfully.' });
      }
    });
  } catch (err) {
    console.error('Error during resending invitation:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete Employee Invitation Function
export async function deleteInvitation(req, res) {
  const { id } = req.params; // Assuming the invitation ID is passed as a URL parameter

  try {
    // Find the invitation by ID and delete it
    const deletedInvitation = await Invitation.findByIdAndDelete(id);

    if (!deletedInvitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ message: 'Invitation deleted successfully', deletedInvitation });
  } catch (error) {
    console.error('Error deleting invitation:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Complete Employee Registration Function
export async function completeEmployeeRegistration(req, res) {
  const {token, name, contact, email, password, pic, role} = req.body;
  
  try {
    // Find the invitation by token
    const invitation = await Invitation.findOne({ token });
    
    if (!invitation) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Check if the email in the invitation matches the email in the form
    if (invitation.email !== email) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    console.log(email)
    // Check if the employee already exists
    let existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new employee instance with hashed password
    const newEmployee = new Employee({
      name,
      contact,
      email,
      password: hashedPassword,
      pic,
      company: invitation.company,
      role
    });
    const newUser = new User({
      email,
      password: hashedPassword,
      userlogin: newEmployee._id,
      employee: Employee,
      role: invitation.role
    })
    await newUser.save();
    // Save the employee details
    await newEmployee.save();
    
    // Update the invitation status to 'accepted'
    invitation.status = 'Active';
    await invitation.save();

    // Respond with success message
    res.status(201).json({ message: 'Employee registered successfully.' });
  } catch (err) {
    console.error('Error during employee registration:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// both login panel   employee and the corporate 
export async function corporateAndEmployeelogin(req, res) {
  const { email, password } = req.body;

  try {
    // Log the incoming request body
    console.log('Request body:', req.body);

    // Check if the user exists
    const user = await User.findOne({ email });
    
    // Log the user data retrieved from the database
    console.log('Retrieved user:', user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the password is provided in the request body
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Log the provided password and the stored hashed password
    console.log('Provided password:', password);
    console.log('Stored hashed password:', user.password);

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Prepare JWT token payload
    const payload = {
      id: user._id,
      role: user.role,
      ...(user.role === 'employee' && { company: user.company }), // Include company field for employees
    };
    
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });    
    // Respond with success and token
    res.status(200).json({ token, userId: user.userlogin , role:user.role });
  } catch (err) {
    console.error('Error during login:', err.message);


    res.status(500).json({ error: 'Server error' });
  }
}

// get all employees
export async function getAllEmployees(req, res) {
  try {
    // Get the company ID from the authenticated user's token
    // const corporateId = req.user.company;
     const {companyId} = req.params;
    // Fetch all employees associated with the corporate ID
    const employees = await Employee.find({ company: companyId });
    
    // Send response with the fetched employees
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

//get employee y id
export async function getEmployeeStatus (req,res){
  try {
    const {companyId} = req.params;

    // Fetch all employees from the database
    const Ivitedemployees = await Invitation.find({ company: companyId });
    
    // Send response with the fetched employees
    res.status(200).json(Ivitedemployees);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete Employee Function
export async function deleteEmployee(req, res) {
  const { id } = req.params;
  console.log(id);

  try {
    // Find the employee by ID
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find and delete the user associated with the employee
    const user = await User.findOne({ email: employee.email });
    if (user) {
      await User.findByIdAndDelete(user._id);
    }

    // Find and delete the invitation associated with the employee
    const invitation = await Invitation.findOne({ email: employee.email });
    if (invitation) {
      await Invitation.findByIdAndDelete(invitation._id);
    }

    // Delete the employee
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee, associated user, and invitation deleted successfully', deletedEmployee });
  } catch (error) {
    console.error('Error deleting employee:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Controller function to get employee by ID
export async function getEmployeeById(req, res) {
  const { id } = req.params;

  try {
    // Find the employee by ID
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee by ID:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateEmployeeProfile(req, res) {
  const { id } = req.params;
  const { name, contact } = req.body;
  const profilePhoto = req.file;
  const profile = req.file ? `/uploads/${profilePhoto.filename}` : null;

  try {
    // Validate ID format
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    // Find the employee by ID
    let employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update only the provided employee details
    if (name !== undefined) employee.name = name;
    if (contact !== undefined) employee.contact = contact;
    if (profile) employee.profilePhoto = profile;

    // Save the updated employee details
    await employee.save();

    // Respond with success message
    res.status(200).json({ message: 'Profile updated successfully', employee });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

