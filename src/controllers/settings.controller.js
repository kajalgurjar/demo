import { genSalt, hash,compare } from 'bcrypt';
import corporateRegistrationModel from '../models/corporate.model.js';
import User from '../models/user.model.js';
import employeeModel from '../models/employee.model.js'; // Assuming you have an Employee model

export async function changePasswordCorporate(req, res) {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    // Validate ID format
    if (!id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Check if all required fields are provided
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Old password, new password, and confirm password are required' });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    // Find the company by ID
    let company = await corporateRegistrationModel.findById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if the old password is correct
    const isMatch = await compare(oldPassword, company.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    // Hash the new password
    const salt = await genSalt(10);
    const hashedPassword = await hash(newPassword, salt);

    // Update the password in the company model
    company.password = hashedPassword;
    await company.save();

    // Update the password in the User model
    await User.updateOne(
      { userlogin: company._id },
      { password: hashedPassword }
    );

    // Respond with success message
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function changePasswordEmployee(req, res) {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    // Validate ID format
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    // Check if all required fields are provided
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Old password, new password, and confirm password are required' });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    // Find the employee by ID
    let employee = await employeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if the old password is correct
    const isMatch = await compare(oldPassword, employee.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    // Hash the new password
    const salt = await genSalt(10);
    const hashedPassword = await hash(newPassword, salt);

    // Update the password in the employee model
    employee.password = hashedPassword;
    await employee.save();

    // Update the password in the User model
    await User.updateOne(
      { userlogin: employee._id },
      { password: hashedPassword }
    );

    // Respond with success message
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}
