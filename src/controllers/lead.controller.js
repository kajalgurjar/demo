import { Lead } from "../models/lead.model.js"; // Import named exports
import Employee from "../models/employee.model.js";
import { Log } from "../models/logs.model.js";
import Company from "../models/corporate.model.js"; // Ensure this path is correct
import mongoose from "mongoose";

export const createLead = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, status, createdBy, role, comments } = req.body;

    // Fetch the names of the assigned employees
    const employees = await Employee.find({ _id: { $in: assignedTo } });
    if (employees.length !== assignedTo.length) {
      return res.status(404).json({ error: "One or more assignees not found" });
    }

    // Map employee names correctly
    const assignedToNames = employees.map(employee => employee.name);

    // Create a new lead
    const newLead = new Lead({
      title,
      description,
      dueDate,
      assignedTo,
      assignedToName: assignedToNames, // Correctly populate assignedToNames array
      status,
      createdBy,
      role,
      comments,
    });

    await newLead.save();

    // Log the creation action
    const logEntry = new Log({
      action: "Lead Created",
      userId: createdBy,
      userType: role, // Use 'role' as userType
      leadId: newLead._id,
      details: `Lead titled "${title}" assigned to ${assignedToNames.join(', ')} by ${createdBy}`,
    });

    await logEntry.save();

    // Send the response
    res.status(201).json({ message: "Lead created successfully", lead: newLead });
  } catch (error) {
    console.error('Error creating lead:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssignee = async (req, res) => {
  try {
    const { leadId, assigneeIndex } = req.params;

    // Validate lead ID
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }

    // Validate assignee index
    if (isNaN(assigneeIndex) || assigneeIndex < 0) {
      return res.status(400).json({ error: "Invalid assignee index" });
    }

    // Find the lead to update
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Check if assignee index is within bounds
    if (assigneeIndex >= lead.assignedTo.length) {
      return res.status(400).json({ error: "Assignee index out of bounds" });
    }

    // Remove assignee from assignedTo and assignedToName arrays
    lead.assignedTo.splice(assigneeIndex, 1);
    lead.assignedToName.splice(assigneeIndex, 1);

    await lead.save();

    res.status(200).json({ message: "Assignee deleted successfully", lead });
  } catch (error) {
    console.error("Error deleting assignee:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { title, description, dueDate, assignedTo, status, role, removeAssignedTo } = req.body;

    // Validate lead ID
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }

    // Find the lead to update
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Handle `assignedTo` field
    let assignedToIds = [];
    let assignedToNames = [];

    if (assignedTo) {
      // Check if `assignedTo` is a single ID or an array
      if (Array.isArray(assignedTo)) {
        assignedToIds = assignedTo;
      } else if (typeof assignedTo === 'string') {
        assignedToIds = [assignedTo];
      }

      // Validate and update `assignedTo` field
      let newAssignees = [];
      for (let id of assignedToIds) {
        // Check if assignee already exists in the lead's `assignedTo` array
        if (!lead.assignedTo.includes(id)) {
          const employee = await Employee.findById(id);
          if (!employee) {
            return res.status(404).json({ error: `Assignee with ID ${id} not found` });
          }
          newAssignees.push(id);
          assignedToNames.push(employee.name);
        }
      }

      // Add new assignees to the existing array
      lead.assignedTo = Array.from(new Set([...lead.assignedTo, ...newAssignees]));
      lead.assignedToName = Array.from(new Set([...lead.assignedToName, ...assignedToNames]));
    }

    // Handle `removeAssignedTo` field for removing assignees
    if (removeAssignedTo) {
      let removeAssignedToIds = [];
      if (Array.isArray(removeAssignedTo)) {
        removeAssignedToIds = removeAssignedTo;
      } else if (typeof removeAssignedTo === 'string') {
        removeAssignedToIds = [removeAssignedTo];
      }

      for (let id of removeAssignedToIds) {
        // Check if assignee exists in the lead's `assignedTo` array
        if (lead.assignedTo.includes(id)) {
          const index = lead.assignedTo.indexOf(id);
          if (index > -1) {
            lead.assignedTo.splice(index, 1); // Remove from assignedTo array
            lead.assignedToName.splice(index, 1); // Remove from assignedToName array
          }
        }
      }
    }

    // Update other lead details
    lead.title = title || lead.title;
    lead.description = description || lead.description;
    lead.dueDate = dueDate || lead.dueDate;
    lead.status = status || lead.status;
    lead.role = role || lead.role;

    await lead.save();

    // Log the update action
    // const logEntry = new Log({
    //   action: "Lead Updated",
    //   userId: req.userId, // Assuming req.userId is set from authentication middleware
    //   userType: req.userRole, // Assuming req.userRole is set from authentication middleware
    //   leadId: lead._id,
    //   details: `Lead titled "${lead.title}" updated. New status: ${lead.status}.`,
    // });

    // await logEntry.save();

    res.status(200).json({ message: "Lead updated successfully", lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Leads
export const getAllLead = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("assigneeTo")
      .populate("createdBy");
    res.status(200).json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get by id Lead
export const getLead = async (req, res) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findById(id)
      .populate("assignee")
      .populate("createdBy");
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json(lead);
  } catch (err) {
    console.error("Error fetching lead:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (err) {
    console.error("Error deleting lead:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//-------------------------------//
export async function getLeadsByCompanyAndStatus(req, res) {
  try {
    const { companyId } = req.params;
    const { status } = req.query; // Get the status from query parameters
    console.log("Company ID:", companyId);
    console.log("Status:", status);

    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    // Build the query object
    const query = { createdBy: companyId };
    if (status) {
      query.status = status;
    }

    // Fetch leads with the specified status (if provided) for the specified company
    const leads = await Lead.find(query);
    console.log("Fetched Leads:", leads);

    if (!leads.length) {
      return res.status(404).json({
        message: `No leads found${
          status ? ` with status '${status}'` : ""
        } for this company`,
      });
    }

    res.status(200).json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateLeadStatus(req, res) {
  try {
    const { leadId } = req.params;
    const { status } = req.body;
    console.log("Lead ID:", leadId);
    console.log("New Status:", status);

    if (!leadId || !status) {
      return res.status(400).json({ error: "Lead ID and status are required" });
    }

    // Update the lead's status
    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(updatedLead);
  } catch (err) {
    console.error("Error updating lead status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// export async function addCommentToLead(req, res) {
//   try {
//     const { leadId } = req.params;
//     const { comments } = req.body;

//     const lead = await Lead.findById(leadId);
//     if (!lead) {
//       return res.status(404).json({ error: "Lead not found" });
//     }

//     lead.comments.push(comments);
//     await lead.save();

//     res.status(200).json({ message: "Comment added successfully" });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// }

export async function addCommentToLead(req, res) {
  try {
    const { leadId } = req.params;
    const { comments, userId } = req.body;

    // Validate input
    if (!comments || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log('Request Body:', req.body);

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    lead.comments.push(comments);
    await lead.save();

    // Retrieve the user's name
    let userName;
    try {
      userName = await Log.getUserName(userId);
    } catch (error) {
      console.error("Error getting user name:", error.message);
      return res.status(500).json({ error: "Error retrieving user information" });
    }

    // Create a log entry
    const logEntry = new Log({
      action: 'Comment Added',
      userId,
      leadId,
      details: `User: ${userName}, Comment: ${comments}`
    });

    await logEntry.save();

    // Send response with user name
    res.status(200).json({
      message: "Comment added successfully and log entry created",
      userName // Include the user's name in the response
    });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ error: "Server error" });
  }
}

// export const deleteComment = async (req, res) => {
//   try {
//     const { leadId, commentIndex } = req.params; // Get leadId and commentIndex from params

//     const lead = await Lead.findById(leadId);
//     if (!lead) {
//       return res.status(404).json({ error: "Lead not found" });
//     }

//     // Check if commentIndex is within bounds
//     if (commentIndex < 0 || commentIndex >= lead.comments.length) {
//       return res.status(400).json({ error: "Invalid comment index" });
//     }

//     // Remove the comment at commentIndex
//     lead.comments.splice(commentIndex, 1);
//     await lead.save();

//     res.status(200).json({ message: "Comment deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting comment:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const deleteComment = async (req, res) => {
  try {
    const { leadId, commentIndex } = req.params; // Get leadId and commentIndex from params
    const { userId } = req.body; // Get userId and role from the request body

    // Validate input
    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Check if commentIndex is within bounds
    if (commentIndex < 0 || commentIndex >= lead.comments.length) {
      return res.status(400).json({ error: "Invalid comment index" });
    }

    // Get the comment to be deleted for logging purposes
    const deletedComment = lead.comments[commentIndex];

    // Remove the comment at commentIndex
    lead.comments.splice(commentIndex, 1);
    await lead.save();

    // Create a log entry
    const logEntry = new Log({
      action: 'Comment Deleted',
      userId: userId,
      leadId: leadId,
      details: `Deleted comment: ${deletedComment}`
    });

    await logEntry.save();

    res.status(200).json({ message: "Comment deleted successfully and log entry created" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// export const updateComment = async (req, res) => {
//   try {
//     const { leadId, commentIndex } = req.params;
//     const { newComment } = req.body;

//     // Log incoming data
//     console.log("Lead ID:", leadId);
//     console.log("Comment Index:", commentIndex);
//     console.log("New Comment:", newComment);

//     // Validate newComment
//     if (typeof newComment !== 'string' || newComment.trim() === '') {
//       return res.status(400).json({ error: "Invalid comment content" });
//     }

//     // Convert commentIndex to a number
//     const index = Number(commentIndex);

//     if (isNaN(index)) {
//       return res.status(400).json({ error: "Invalid comment index" });
//     }

//     // Fetch the lead from the database
//     const lead = await Lead.findById(leadId);

//     // Log retrieved lead document
//     console.log("Lead document retrieved:", lead);

//     if (!lead) {
//       return res.status(404).json({ error: "Lead not found" });
//     }

//     // Validate that index is within the range of comments array
//     if (index < 0 || index >= lead.comments.length) {
//       console.log("Index out of bounds:", index);
//       return res.status(400).json({ error: "Invalid comment index" });
//     }

//     // Update the comment
//     lead.comments[index] = newComment;

//     // Log updated comments
//     console.log("Updated Comments:", lead.comments);

//     // Save the document
//     await lead.save();

//     // Log successful save
//     console.log("Document saved successfully");

//     res.status(200).json({ message: "Comment updated successfully" });
//   } catch (error) {
//     console.error("Error updating comment:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const updateComment = async (req, res) => {
  try {
    const { leadId, commentIndex } = req.params;
    const { newComment, userId } = req.body;

    // Log incoming data
    console.log("Lead ID:", leadId);
    console.log("Comment Index:", commentIndex);
    console.log("New Comment:", newComment);

    // Validate newComment
    if (typeof newComment !== 'string' || newComment.trim() === '') {
      return res.status(400).json({ error: "Invalid comment content" });
    }

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert commentIndex to a number
    const index = Number(commentIndex);

    if (isNaN(index)) {
      return res.status(400).json({ error: "Invalid comment index" });
    }

    // Fetch the lead from the database
    const lead = await Lead.findById(leadId);

    // Log retrieved lead document
    console.log("Lead document retrieved:", lead);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Validate that index is within the range of comments array
    if (index < 0 || index >= lead.comments.length) {
      console.log("Index out of bounds:", index);
      return res.status(400).json({ error: "Invalid comment index" });
    }

    // Update the comment
    const oldComment = lead.comments[index];
    lead.comments[index] = newComment;

    // Log updated comments
    console.log("Updated Comments:", lead.comments);

    // Save the document
    await lead.save();

    // Log successful save
    console.log("Document saved successfully");

    // Retrieve the user's name
    let userName;
    try {
      userName = await Log.getUserName(userId);
    } catch (error) {
      console.error("Error getting user name:", error.message);
      return res.status(500).json({ error: "Error retrieving user information" });
    }

    // Create a log entry
    const logEntry = new Log({
      action: 'Comment Updated',
      userId,
      leadId,
      details: `User: ${userName}, Updated comment from: ${oldComment} to: ${newComment}`
    });

    await logEntry.save();

    // Send response with user name
    res.status(200).json({
      message: "Comment updated successfully and log entry created",
      userName // Include the user's name in the response
    });
  } catch (error) {
    console.error("Error updating comment:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUnassignedEmployees = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Fetch the lead from the database
    const lead = await Lead.findById(leadId).populate('assignedTo');

    // Log retrieved lead document
    console.log("Lead document retrieved:", lead);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Get all employees
    const allEmployees = await Employee.find();

    // Log all employees
    console.log("All employees:", allEmployees);

    // Filter out employees who are already assigned to the lead
    const unassignedEmployees = allEmployees.filter(employee =>
      !lead.assignedTo.some(assignedEmployee => assignedEmployee._id.equals(employee._id))
    );

    // Log unassigned employees
    console.log("Unassigned employees:", unassignedEmployees);

    res.status(200).json(unassignedEmployees);
  } catch (error) {
    console.error("Error fetching unassigned employees:", error);
    res.status(500).json({ error: "Server error" });
  }
};

//for dash boar API
export const getLeadsAssignedToEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params; // Expecting employeeId in request params

    // Find leads where the assignedTo array contains the employeeId
    const leads = await Lead.find({ assignedTo: employeeId }).populate('assignedTo').populate('corporateId').populate('employeeId');

    if (!leads.length) {
      return res.status(404).json({ message: 'No leads assigned to this employee' });
    }

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


