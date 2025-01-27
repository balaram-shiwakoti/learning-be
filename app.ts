import cors from "cors";
require("dotenv").config();
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";

export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

//cors

app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

//routes
app.use("/api/v1", userRouter);

//testing api

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Api is working",
  });
});

app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
