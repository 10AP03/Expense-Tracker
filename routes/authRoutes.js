import express from "express";
import {registerUser,loginUser} from "../controllers/authController.js";

const router = express.Router();

// 1.Register
router.post("/register",registerUser);

// 2.Login
router.post("/login",loginUser);

export default router;