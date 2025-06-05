import type { Request, Response, NextFunction } from "express"
import { ValidationError } from "yup"
import { AppError } from "../utils/appError"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err)

  // Handle Yup validation errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors,
    })
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // Handle Mongoose duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    })
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Your token has expired. Please log in again",
    })
  }

  // Default error
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  })
}
