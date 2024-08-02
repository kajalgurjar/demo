import ApiError from '../utils/ApiError.js';

const rolemiddleware = (...roleSent) => {
  return (req, res, next) => {
    // Check if the user's role matches one of the allowed roles
    if (!roleSent.includes(req.user.role)) {
      throw new ApiError(403, 'Access denied');
    }

    // Proceed to the next middleware or route handler
    next();
  };
};

export default rolemiddleware;
