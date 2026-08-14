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

// Credential management (change email/password, delete account) lives in
// auth-service but, unlike login/signup/refresh, requires an authenticated
// caller — so it is mounted here, after `authenticate`, rather than under
// the public /api/auth passthrough above.
// Express has already stripped the "/api/account" mount prefix by the time the
// proxy reads req.url, so this prepends auth-service's own "/account" mount
// rather than stripping anything: "/me" -> "/account/me".
app.use(
  "/api/account",
  createServiceProxy(env.AUTH_SERVICE_URL, { "^/": "/account/" }),
);

app.use("/api/user", createServiceProxy(env.USER_SERVICE_URL));
app.use(
  "/api/video",
  createServiceProxy(env.VIDEO_SERVICE_URL, { "^/api/video": "" }),
);
// search-service owns no data — it fans the query out to the two services
// above and merges the answers, so it sits behind the same identity headers.
app.use("/api/search", createServiceProxy(env.SEARCH_SERVICE_URL));

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
