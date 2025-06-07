import mongoose from "mongoose";

// TypeScript Interface
export interface IWorkshopBooking extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  timeslot: "morning" | "afternoon" | "evening";
  experience: "beginner" | "intermediate" | "advanced";
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const bookingSchema = new mongoose.Schema<IWorkshopBooking>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeslot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    message: {
      type: String,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model<IWorkshopBooking>("Booking", bookingSchema);

export default Booking;
