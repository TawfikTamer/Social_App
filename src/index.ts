import "dotenv/config";
import express, { Response, Request, NextFunction } from "express";
import { dbConnection } from "./DB/db.connection";
import { authRouter } from "./Modules/Users/Controllers/auth.controller";

const app = express();

dbConnection();

app.use(express.json());

app.use("/api/user", authRouter);

app.use((err: Error | null, _req: Request, _res: Response, _next: NextFunction) => {
  console.log(err);
  _res.status(500).json({ msg: `Server Error`, error: err });
});

app.listen(process.env.PORT, () => {
  console.log(`server running at ${process.env.PORT}`);
});
