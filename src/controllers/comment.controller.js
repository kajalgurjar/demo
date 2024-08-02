// controllers/commentController.js
import Comment from '../models/comment.model.js';

//create te commment 
export const createComment = async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id; // Assuming you have a user authentication middleware

  try {
    const newComment = new Comment({ text, userId });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error); // Log the error to the console
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//update the comment
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    comment.text = text;
    comment.updatedAt = Date.now();
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// // controllers/comment.controller.js
// export const deleteComment = async (req, res) => {
//   const { commentId } = req.params;
//   const userId = req.user._id; // Assuming req.user is set by auth middleware

//   try {
//     // Find the comment by ID
//     const comment = await Comment.findById(commentId);
//     if (!comment) {
//       return res.status(404).json({ message: 'Comment not found' });
//     }

//     // Check if the user is authorized to delete the comment
//     if (comment.userId.toString() !== userId.toString()) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     // Delete the comment
//     await comment.remove();

//     // Respond with success message
//     res.status(200).json({ message: 'Comment deleted' });
//   } catch (error) {
//     // Handle server errors
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

