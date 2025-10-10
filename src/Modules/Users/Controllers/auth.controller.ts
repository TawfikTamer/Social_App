import { Router } from "express";
import AuthService from "../Services/auth.service";
import {
  authenticationMiddleware,
  validationMiddleware,
  verifyRefreshTokenMiddleware,
} from "../../../Middlewares";
import {
  ConfirmEmailValidator,
  forgetPasswordValidator,
  LogInValidator,
  ResetPasswordValidator,
  SignUpVa1idator,
} from "../../../Utils";

const authRouter = Router();

authRouter.post(
  "/auth/SignUp",
  validationMiddleware(SignUpVa1idator),
  AuthService.singUp
);
authRouter.post("/auth/auth-gmail", AuthService.gmailAuth);
authRouter.patch(
  "/auth/Confirm",
  validationMiddleware(ConfirmEmailValidator),
  AuthService.confirmEmail
);
authRouter.post(
  "/auth/login",
  validationMiddleware(LogInValidator),
  AuthService.logIn
);
authRouter.post(
  "/auth/forget-password",
  validationMiddleware(forgetPasswordValidator),
  AuthService.forgetPassword
);
authRouter.patch(
  "/auth/reset-password",
  validationMiddleware(ResetPasswordValidator),
  authenticationMiddleware,
  AuthService.resetPassword
);
authRouter.post(
  "/auth/logout",
  authenticationMiddleware,
  verifyRefreshTokenMiddleware,
  AuthService.logOut
);

authRouter.patch(
  "/auth/refresh-token",
  verifyRefreshTokenMiddleware,
  AuthService.refreshToken
);

export { authRouter };
