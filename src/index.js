import app from './app.js'; // Import the Express app
import { connectDB } from './db/db.config.js'; // Import the MongoDB connection function

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully'); // Notification for successful connection
    // Start the Express server
    const PORT = process.env.PORT || 8001; // Default to port 8000 if PORT is not defined in .env
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure if MongoDB connection fails
  });
