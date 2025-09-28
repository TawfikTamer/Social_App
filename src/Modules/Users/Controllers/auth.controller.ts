import { Router } from "express";
import AuthService from "../Services/auth.service";
import { authenticationMiddleware } from "../../../Middlewares";

const authRouter = Router();

authRouter.post("/auth/SignUp", AuthService.singUp);
authRouter.patch("/auth/Confirm", AuthService.confirmEmail);
authRouter.post("/auth/login", AuthService.logIn);
authRouter.post("/auth/logout", authenticationMiddleware, AuthService.logOut);

export { authRouter };
