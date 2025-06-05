import mongoose from "mongoose";

export interface IEnquiry extends mongoose.Document {
  fullName: string;
  email: string;
  phone: string;
  yogaExperience: string;
  motivation: string;
}

const enquirySchema = new mongoose.Schema<IEnquiry>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 300,
    },
    phone: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/, // Indian phone validation example, adjust if needed
    },
    yogaExperience: {
      type: String,
      required: true,
      maxlength: 500,
    },
    motivation: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const Enquiry = mongoose.model<IEnquiry>("Enquiry", enquirySchema);

export default Enquiry;
