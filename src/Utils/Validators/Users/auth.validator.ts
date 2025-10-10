import { genderEnum } from "../../../Common";
import z from "zod";

export const SignUpVa1idator = {
  body: z
    .strictObject({
      userName: z.string().min(3).max(10),
      email: z.email(),
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
        ),
      confirmPassword: z.string(),
      gender: z.enum(genderEnum),
      DOB: z.iso.date(),
      phoneNumber: z.string().min(11).max(11),
    })
    .superRefine((val, cxt) => {
      if (val.password !== val.confirmPassword) {
        cxt.addIssue({
          code: z.ZodIssueCode.custom,
          message: "passwords do not Match",
          path: ["PasswordConfirmation"],
        });
      }
    }),
};

export const ConfirmEmailValidator = {
  body: z.strictObject({
    OTP: z.string(),
    email: z.email(),
  }),
};

export const LogInValidator = {
  body: z.strictObject({
    email: z.email(),
    password: z.string(),
  }),
};

export const forgetPasswordValidator = {
  body: z.strictObject({
    email: z.email(),
  }),
};

export const ResetPasswordValidator = {
  body: z
    .strictObject({
      otp: z.string().length(6),
      newPassword: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
        ),
      confirmNewPassword: z.string(),
    })
    .superRefine((val, cxt) => {
      if (val.newPassword !== val.confirmNewPassword) {
        cxt.addIssue({
          code: z.ZodIssueCode.custom,
          message: "passwords do not Match",
          path: ["PasswordConfirmation"],
        });
      }
    }),
};
