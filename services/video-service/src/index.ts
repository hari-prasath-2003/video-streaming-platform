import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import logger from "@video-streaming/logger";
import { AuthError, CustomError } from "@video-streaming/common";
import { env } from "./config/env.js";
import { uploadRoot } from "./utils/Storage.js";
import videoRoutes from "./routes/video.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  try {
    const userId = req.header("x-user-id");

    if (!userId) {
      throw new AuthError("need to authenticate to access this service");
    }

    req.user = {
      uid: userId,
      email: req.header("x-email") || "",
      role: req.header("x-role") || "user",
    };

    next();
  } catch (error) {
    next(error);
  }
});

// gateway strips the "/api/video" mount prefix before proxying here, so
// routes are mounted root-relative (matching auth-service's convention).
// mediaUrl() in routes/video.ts still returns gateway-facing "/api/video/media/..."
// paths since the frontend talks to the gateway, not this service, directly.
app.use("/media", express.static(uploadRoot));
app.use("/", videoRoutes);

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

app.listen(env.SERVER_PORT, () => {
  logger.info(`Video service is running on port ${env.SERVER_PORT}`);
});
