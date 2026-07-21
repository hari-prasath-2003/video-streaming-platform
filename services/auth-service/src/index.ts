import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import logger from "@video-streaming/logger";
import authRoutes from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CustomError } from "@video-streaming/common";

const PORT = process.env.SERVER_PORT || 3000;

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(authRoutes);

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    logger.error(error);
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
      return res.sendStatus(500);
    }

    return res.status(statusCode).json({
      message: error.message,
      details: error.details || null,
    });
  },
);

app.listen(PORT, () => {
  logger.info(`Auth service is running on port ${PORT}`);
});
