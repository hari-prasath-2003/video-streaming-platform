import { AuthError, RefreshToken } from "@video-streaming/common";
import { JWTPayload, jwtVerify, errors } from "jose";

export async function verifyJwtRefreshToken(
  refreshToken: string,
  secret: string,
): Promise<RefreshToken> {
  const { payload } = await jwtVerify<RefreshToken>(
    refreshToken,
    new TextEncoder().encode(secret),
    {
      issuer: "auth-service",
      audience: "auth-service",
    },
  );

  return payload;
}
