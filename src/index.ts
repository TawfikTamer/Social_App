import "dotenv/config";
import express, { Response, Request, NextFunction } from "express";
import { dbConnection } from "./DB/db.connection";
import { authRouter } from "./Modules/Users/Controllers/auth.controller";
import { FailedResponse, HttpException } from "./Utils";
import cors from "cors";
import { userRouter } from "./Modules/Users/Controllers/user.controller";
import { ioInitializer } from "./Gatewayes/socketIo.gatewaye";

const app = express();

dbConnection();
// Handle CORS
const whitelist = process.env.WHITELIST?.split(",");
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin || whitelist?.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/user", authRouter, userRouter);

app.use((_req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

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
    console.log(err);
    res.status(500).json(FailedResponse("Somthing Went Wrong", 500, err));
  }
);

const server = app.listen(process.env.PORT, () => {
  console.log(`server running at ${process.env.PORT}`);
});

ioInitializer(server);
