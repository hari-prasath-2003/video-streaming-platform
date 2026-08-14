import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import logger from "@video-streaming/logger";
import { AuthError, CustomError } from "@video-streaming/common";
import { MulterError } from "multer";
import { env } from "./config/env.js";
import { uploadRoot } from "./utils/Storage.js";
import profileRoutes from "./routes/profile.js";
import channelRoutes from "./routes/channel.js";
import subscriptionRoutes from "./routes/subscription.js";
import accountRoutes from "./routes/account.js";
import searchRoutes from "./routes/search.js";

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

// gateway strips the "/api/user" mount prefix before proxying here, so
// routes are mounted root-relative (matching auth-service's convention).
// Uploaded avatars/banners. Served from behind the auth middleware, matching
// video-service — <img> tags reach these through the gateway's ?token= fallback.
app.use("/media", express.static(uploadRoot));
app.use("/me", accountRoutes);
app.use("/search", searchRoutes);
app.use("/profiles", profileRoutes);
app.use("/channels", channelRoutes);
app.use("/", subscriptionRoutes);

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    logger.error(error);

    // Multer rejects oversized/non-image uploads with its own error type,
    // which carries no statusCode — surface those as 400 rather than 500.
    if (error instanceof MulterError) {
      return res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5MB or smaller."
            : error.message,
        details: null,
      });
    }

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
  logger.info(`User service is running on port ${env.SERVER_PORT}`);
});
