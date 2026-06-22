import express from "express";
import {getUserProfile} from "../controllers/userController.js";
import protect from "../middleware/authmiddleware.js";

const router = express.Router();

// Get Logged-in User Profile
router.get("/profile", protect, getUserProfile);

export default router;
