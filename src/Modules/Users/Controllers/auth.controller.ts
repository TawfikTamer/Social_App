import { Router } from "express";
import AuthService from "../Services/auth.service";
import {
  authenticationMiddleware,
  verifyRefreshTokenMiddleware,
} from "../../../Middlewares";

const authRouter = Router();

authRouter.post("/auth/SignUp", AuthService.singUp);
authRouter.post("/auth/auth-gmail", AuthService.gmailAuth);
authRouter.patch("/auth/Confirm", AuthService.confirmEmail);
authRouter.post("/auth/login", AuthService.logIn);
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
