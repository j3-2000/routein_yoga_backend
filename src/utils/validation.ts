import * as yup from "yup"

// Password test function
export const passwordTest = (required: boolean) => {
  return {
    name: "password",
    message: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number",
    test: (value: string | undefined) => {
      if (!required && !value) return true
      if (!value) return false

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      return passwordRegex.test(value)
    },
  }
}

// String test function
export const stringTest = (required: boolean) => {
  return {
    name: "string",
    message: "Field is required",
    test: (value: string | undefined) => {
      if (!required && !value) return true
      return !!value && value.trim().length > 0
    },
  }
}

// Validation schema
export const schema = yup.object({
  fullName: yup.string().trim().required("Name is required").max(150),
  email: yup.string().email("Invalid email").trim().required("Email is required").max(300),
  password: yup.string().trim().required("Password is required").test(passwordTest(true)).max(100),

  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid Indian phone number"),

  age: yup.number().required("Age is required").min(12, "Minimum age is 12").max(100, "Maximum age is 100"),

  gender: yup.string().required("Gender is required").oneOf(["Male", "Female", "Other"], "Select a valid gender"),

  experience: yup
    .string()
    .required("Experience level is required")
    .oneOf(["beginner", "intermediate", "advanced"], "Select a valid experience level"),

  healthCondition: yup.string().max(500, "Maximum 500 characters"),

  batchTime: yup
    .string()
    .required("Preferred batch time is required")
    .oneOf(["Morning", "Afternoon", "Evening"], "Select a valid batch time"),

  acceptTerms: yup.boolean().oneOf([true], "You must accept the terms and conditions"),
})

export type TSchema = yup.InferType<typeof schema>
