import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../models/user"
import { AppError } from "../utils/appError"

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
      }
    }
  }
}

// Protect routes middleware
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return next(new AppError("You are not logged in. Please log in to get access", 401))
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string }

    // Check if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      return next(new AppError("The user belonging to this token no longer exists", 401))
    }

    // Grant access to protected route
    req.user = { id: user._id.toString() }
    next()
  } catch (error: any) {
    next(new AppError("Invalid token. Please log in again", 401))
  }
}
