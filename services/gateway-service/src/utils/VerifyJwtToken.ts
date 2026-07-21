import logger from "@video-streaming/logger";
import { AccessToken, AuthError } from "@video-streaming/common";

import { jwtVerify } from "jose";

export async function verifyJwtToken(
  token: string,
  secret: string,
): Promise<AccessToken> {
  const { payload } = await jwtVerify<AccessToken>(
    token,
    new TextEncoder().encode(secret),
    {
      issuer: "auth-service",
      audience: "gateway",
    },
  );

  return payload;
}
