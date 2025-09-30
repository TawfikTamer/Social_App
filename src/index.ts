import "dotenv/config";
import express, { Response, Request, NextFunction } from "express";
import { dbConnection } from "./DB/db.connection";
import { authRouter } from "./Modules/Users/Controllers/auth.controller";
import { HttpException } from "./Utils";

const app = express();

dbConnection();

app.use(express.json());

app.use("/api/user", authRouter);

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
    console.log(err);
    if (err instanceof HttpException) {
      return res
        .status(err.statusCode)
        .json({ errorMessage: err.message, error: err.error });
    }
    res.status(500).json({ msg: `Somthing Went wrong`, error: err?.message });
  }
);

app.listen(process.env.PORT, () => {
  console.log(`server running at ${process.env.PORT}`);
});
