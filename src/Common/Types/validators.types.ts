import z from "zod";
import {
  SignUpVa1idator,
  ConfirmEmailValidator,
  LogInValidator,
  forgetPasswordValidator,
  ResetPasswordValidator,
} from "../../Utils";

export type SignUpBodyType = z.infer<typeof SignUpVa1idator.body>;
export type ConfirmEmailBodyType = z.infer<typeof ConfirmEmailValidator.body>;
export type LogInBodyType = z.infer<typeof LogInValidator.body>;
export type ForgetPasswordBodyType = z.infer<
  typeof forgetPasswordValidator.body
>;
export type ResetPasswordBodyType = z.infer<typeof ResetPasswordValidator.body>;
