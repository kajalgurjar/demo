import { Lead } from "../models/lead.model.js"; // Import named exports
// import Log from "../models/logs.model.js";
import { Log } from "../models/logs.model.js";
import Company from "../models/corporate.model.js"; // Ensure this path is correct
import mongoose from "mongoose";

export const getAllLogs = async (req, res) => {
    try {
      const logs = await Log.find()
       
      res.status(200).json(logs);
    } catch (err) {
      console.error("Error fetching logs:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  };