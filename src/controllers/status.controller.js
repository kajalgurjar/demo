// import Lead from '../models/lead.model.js';
import { Lead} from '../models/lead.model.js'; // Import named exports


export const updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate the new status
  const validStatuses = ['Pending', 'In Conversation', 'In Progress', 'Win', 'Lost'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Find the lead by ID and update the status
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    // Check if the lead was found and updated
    if (!updatedLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.status(200).json({ message: 'Lead status updated successfully', lead: updatedLead });
  } catch (err) {
    console.error('Error updating lead status:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
