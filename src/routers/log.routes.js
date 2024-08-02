import express from "express";
import {
    getAllLogs
} from "../controllers/log.controller.js";
import verifyAPIKey from "../middleware/verifyAPIKey.js";

const router = express.Router();

// Create lead route
router.get("/logs/", verifyAPIKey, getAllLogs);


export default router;
