import express from "express"
import { register, login, getProfile,handleEnquiry  ,contactUs} from "../controllers/auth"
import { protect } from "../middleware/auth"

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)

// Protected routes
router.get("/profile", protect, getProfile)
router.post("/community/join", handleEnquiry )
router.post("/contact", contactUs);

export default router
