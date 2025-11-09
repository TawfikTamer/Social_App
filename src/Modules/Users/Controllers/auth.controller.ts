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
  "/auth/login-with-2FA",
  authenticationMiddleware,
  AuthService.logInWith2FA
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

authRouter.post(
  "/auth/2FA-enable",
  authenticationMiddleware,
  AuthService.enable2FA
);

authRouter.patch(
  "/auth/2FA-confirm-enable",
  authenticationMiddleware,
  AuthService.confirm2FA
);

authRouter.patch(
  "/auth/2FA-disable",
  authenticationMiddleware,
  AuthService.disable2FA
);

export { authRouter };
