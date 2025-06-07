import express from "express";
import { createBooking  } from "../controllers/workshop"
import { protect } from "../middleware/auth"

const router = express.Router();

// 🔐 Protected route: user must be logged in
router.post("/book", protect, createBooking);

export default router;
