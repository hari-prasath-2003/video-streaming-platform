import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import logger from "@video-streaming/logger";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "./config/env.js";
import cors from "cors";
import authenticate from "./authenticate.js";
import { CustomError } from "@video-streaming/common";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
  }),
);

app.use(authenticate);

const createServiceProxy = (
  target: string,
  pathRewrite?: Record<string, string>,
) => {
  return createProxyMiddleware<Request, Response>({
    target,
    changeOrigin: true,
    ...(pathRewrite ? { pathRewrite } : {}),

    on: {
      proxyReq(proxyReq, req) {
        if (!req.user) return;

        proxyReq.setHeader("x-user-id", req.user.uid);
        proxyReq.setHeader("x-email", req.user.email);
        proxyReq.setHeader("x-role", req.user.role || "user");
      },
    },
  });
};

app.use("/api/user", createServiceProxy(env.USER_SERVICE_URL));
app.use(
  "/api/video",
  createServiceProxy(env.VIDEO_SERVICE_URL, { "^/api/video": "" }),
);

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
  logger.info(`Api Gateway service is running on port ${env.SERVER_PORT}`);
});
