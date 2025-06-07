import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";
import User from "../models/user"
import Enquiry from "../models/enquiry"
import { schema, type TSchema } from "../utils/validation"
import { AppError } from "../utils/appError"
import dotenv from "dotenv";
dotenv.config();

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  })
}

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const userData: TSchema = await schema.validate(req.body, { abortEarly: false })

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400))
    }

    // Create new user
    const user = await User.create(userData)

    // Generate token
    const token = generateToken(user._id.toString())

    // Return user data without password
    const { password, ...userWithoutPassword } = user.toObject()

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error: any) {
    next(error)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Check if email and password are provided
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400))
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return next(new AppError("Invalid email or password", 401))
    }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid email or password", 401))
    }

    // Generate token
    const token = generateToken(user._id.toString())

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toObject()

    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error: any) {
    next(error)
  }
}

// Get user profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select("-password")

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error: any) {
    next(error)
  }
}

// export const handleEnquiry = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { fullName, email, phone, yogaExperience, motivation } = req.body;

//     if (!fullName || !email || !phone || !yogaExperience || !motivation) {
//       return next(new AppError("All fields are required", 400));
//     }

//     const newEnquiry = new Enquiry({
//       fullName,
//       email,
//       phone,
//       yogaExperience,
//       motivation,
//     });

//     await newEnquiry.save();

//     res.status(201).json({
//       success: true,
//       message: "Enquiry submitted successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const handleEnquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone, yogaExperience, motivation } = req.body;

    if (!fullName || !email || !phone || !yogaExperience || !motivation) {
      return next(new AppError("All fields are required", 400));
    }

    const newEnquiry = new Enquiry({
      fullName,
      email,
      phone,
      yogaExperience,
      motivation,
    });

    await newEnquiry.save();

    // Send Email to Admin
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: `"RouteIn Yoga" <${process.env.EMAIL_USER}>`, // sender is your Gmail
  to: process.env.ADMIN_EMAIL,                        // recipient is admin email
  subject: "New Enquiry Received",
  html: `
    <h2>New Yoga Enquiry</h2>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Yoga Experience:</strong> ${yogaExperience}</p>
    <p><strong>Motivation:</strong> ${motivation}</p>
  `,
};


    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending mail:", err);
      } else {
        console.log("Enquiry email sent:", info.response);
      }
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const contactUs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, intention, message } = req.body;

    if (!name || !email || !phone || !intention) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"RouteInYoga Contact" <${process.env.SMTP_USER}>`,
      to: "admin@routeinyoga.com",
      subject: "New Contact Us Enquiry",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; border-radius: 8px;">
          <h2 style="color: #4caf50;">New Contact Us Enquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Intention of Practice:</strong> ${intention}</p>
          <p><strong>Message:</strong> ${message || "N/A"}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Enquiry sent successfully!" });
  } catch (error) {
    console.error("Contact Us Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
