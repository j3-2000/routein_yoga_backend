import type { Request, Response, NextFunction } from "express";
import Booking from "../models/booking";
import { AppError } from "../utils/appError";
import nodemailer from "nodemailer";
import User from "../models/user"; 
import dotenv from "dotenv";
dotenv.config();

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { timeslots, experience, message } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!timeslots || !experience) {
      return next(new AppError("Timeslots and experience are required", 400));
    }

    if (!userId) {
      return next(new AppError("User ID is required", 400));
    }

    // Fetch user from DB
    const user = await User.findById(userId).select("fullName email"); // or userName, depends on your schema
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      timeslots,
      experience,
      message,
    });

    // Send Email to Admin about new booking
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"RouteIn Yoga" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Workshop Booking Received",
html: `
  <div style="
    font-family: Arial, sans-serif; 
    color: #333333; 
    line-height: 1.5; 
    max-width: 600px; 
    margin: auto; 
    padding: 20px; 
    background: #f9f9f9; 
    border-radius: 8px; 
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  ">
    <h2 style="color: #2c3e50; border-bottom: 2px solid #4caf50; padding-bottom: 8px;">
      New Workshop Booking
    </h2>
    <p><strong style="color: #4caf50;">User Name:</strong> ${user.fullName}</p>
    <p><strong style="color: #4caf50;">Phone Number:</strong> ${user.phoneNumber}</p>
    <p><strong style="color: #4caf50;">User Email:</strong> ${user.email}</p>
    <p><strong style="color: #4caf50;">Timeslots:</strong> ${timeslots}</p>
    <p><strong style="color: #4caf50;">Experience:</strong> ${experience}</p>
    <p><strong style="color: #4caf50;">Message:</strong> ${message || "N/A"}</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
    <p style="font-size: 12px; color: #999;">
      This is an automated notification email from RouteInYoga.
    </p>
  </div>
`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending booking mail:", err);
      } else {
        console.log("Booking email sent:", info.response);
      }
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
