// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import Employee from '../models/employee.model.js';
import Company from '../models/corporate.model.js';

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  // Check if token exists
  if (!token) {
    return next(new ApiError(401, 'No token, authorization denied'));
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.ACCESS_TOKEN_SECRET);

    let user;
    let role;

    if (decoded && decoded.employee && decoded.employee.id) {
      // If the token contains employee info
      const userId = decoded.employee.id;
      user = await Employee.findById(userId);
      role = '3';
    } else if (decoded && decoded.company && decoded.company.id) {
      // If the token contains company info
      const companyId = decoded.company.id;
      user = await Company.findById(companyId);
      role = '2';
    }

    if (!user) {
      return next(new ApiError(404, `${role} not found`));
    }

    // Attach user details to req.user
    req.user = {
      _id: user._id,
      email: user.email,
      role, // Adding role to identify the user type
      // Add any other user information you need here
    };

    next(); // Move to the next middleware or route handler
  } catch (err) {
    // Handle token verification errors
    return next(new ApiError(401, 'Token is not valid'));
  }
};

export default authMiddleware;
