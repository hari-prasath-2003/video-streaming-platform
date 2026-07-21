import type { AccessToken } from "@video-streaming/common";

declare global {
  namespace Express {
    interface Request {
      user?: AccessToken;
    }
  }
}

export {};
