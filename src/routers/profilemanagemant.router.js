import { Router } from "express";
import multer from "multer";
import {
    updateProfile
} from "../controllers/corporate.controller.js";
import{
    updateEmployeeProfile
} from "../controllers/employee.controller.js"
import  verifyJWT  from "../middleware/auth.middleware.js";
import upload  from "../middleware/multer.middleware.js";

const router = Router();

router.put("/profile/:id", (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(500).json(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json(err);
    }
    // Everything went fine.
    updateProfile(req, res, next);
  });
});

router.put("/profileEmployee/:id", (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(500).json(err);
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(500).json(err);
      }
      // Everything went fine.
      updateEmployeeProfile(req, res, next);
    });
  });
  
export default router;