import "dotenv/config";
import express, { Response, Request, NextFunction } from "express";
import cors from "cors";
import { dbConnection } from "./DB/db.connection";
import {
  authRouter,
  userRouter,
  postRouter,
  commentRouter,
  reactionRouter,
} from "./Modules/controllers.index";
import { FailedResponse, HttpException } from "./Utils";
import { ioInitializer } from "./Gatewayes/socketIo.gatewaye";

// ------------------------- Main application entry point -------------------------
const app = express();

// ------------------------- Initialize DB connection -------------------------
dbConnection();

// ------------------------- CORS configuration -------------------------
const whitelist = process.env.WHITELIST?.split(",");
const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (e.g., server-to-server or Postman)
    if (!origin || whitelist?.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

// ------------------------- Route mounting -----------------------------
// Authentication and user-related routes
app.use("/api/user", authRouter, userRouter);

// Post, comment and reaction routes
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/reaction", reactionRouter);

// ------------------------- 404 handler --------------------------------
app.use((_req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// ------------------------- Global error handler -----------------------
app.use(
  (
    err: HttpException | Error | null,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (err instanceof HttpException) {
      return res
        .status(err.statusCode)
        .json(FailedResponse(err.message, err.statusCode, err.error));
    }
    // Log unexpected errors for diagnostics and return generic message
    console.log(err);
    res.status(500).json(FailedResponse("Something Went Wrong", 500, err));
  }
);

// ------------------------- Server startup -----------------------------
const server = app.listen(process.env.PORT, () => {
  console.log(`server running at ${process.env.PORT}`);
});

// ------------------------- Initialize Socket.IO -----------------------
ioInitializer(server);

// to do:
/**
 * erro handling responses
 * delete user api
 */
