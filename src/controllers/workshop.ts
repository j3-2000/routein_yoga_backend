import type { Request, Response, NextFunction } from "express";
import Booking from "../models/booking";
import { AppError } from "../utils/appError";

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { timeslots, experience, message } = req.body;

    if (!timeslots || !experience) {
      return next(new AppError("Timeslots and experience are required", 400));
    }

    const booking = await Booking.create({
      userId: req.user?.id,
      timeslots,
      experience,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Workshop booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
