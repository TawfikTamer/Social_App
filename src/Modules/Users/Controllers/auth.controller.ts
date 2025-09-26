import { Router } from "express";
import AuthService from "../Services/auth.service";

const authRouter = Router();

authRouter.post("/auth/SignUp", AuthService.singUp);
authRouter.patch("/auth/Confirm", AuthService.confirmEmail);

export { authRouter };
