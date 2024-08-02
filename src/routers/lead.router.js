import express from "express";
import {
  createLead,
  getLead,
  getAllLead,
  updateLead,
  deleteLead,
  getLeadsByCompanyAndStatus,
  updateLeadStatus,
  addCommentToLead,
  deleteComment,
  updateComment,
  getUnassignedEmployees,
  deleteAssignee,
  getLeadsAssignedToEmployee,
} from "../controllers/lead.controller.js";
import verifyAPIKey from "../middleware/verifyAPIKey.js";

const router = express.Router();

// Create lead route
router.post("/create", verifyAPIKey, createLead);
// Get lead route
router.get("/leads/:id", verifyAPIKey, getLead);
router.get("/leads", verifyAPIKey, getAllLead);
router.get("/get-leads-by-company/:companyId", getLeadsByCompanyAndStatus);
router.put("/change-status/:leadId", updateLeadStatus);
router.put("/add-comment/:leadId", addCommentToLead);
router.delete("/delete-comment/:leadId/:commentIndex", deleteComment);
router.put("/update-comment/:leadId/:commentIndex",updateComment);
router.get('/:leadId/unassigned-employees', getUnassignedEmployees);
router.delete('/:leadId/assignees/:assigneeIndex', deleteAssignee);
router.put("/update/:leadId", updateLead);
router.delete("/:id",verifyAPIKey, deleteLead);

// for employee dashboard
router.get('/assigned-to/:employeeId', getLeadsAssignedToEmployee);


export default router;
