import mongoose from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends mongoose.Document {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  age: number
  gender: "Male" | "Female" | "Other"
  experience: "beginner" | "intermediate" | "advanced"
  healthCondition?: string
  batchTime: "Morning" | "Afternoon" | "Evening"
  acceptTerms: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>(
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
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 300,
    },
    password: {
      type: String,
      required: true,
      maxlength: 100,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
    },
    age: {
      type: Number,
      required: true,
      min: 12,
      max: 100,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    experience: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    healthCondition: {
      type: String,
      maxlength: 500,
      default: "",
    },
    batchTime: {
      type: String,
      required: true,
      enum: ["Morning", "Afternoon", "Evening"],
    },
    acceptTerms: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model<IUser>("User", userSchema)

export default User
