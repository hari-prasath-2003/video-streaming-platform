import { AccessToken, RefreshToken } from "@video-streaming/common";
import { SignJWT } from "jose";

export async function generateJwtToken(
  payload: AccessToken | RefreshToken,
  secret: string,
  expiresIn: string,
  issuer: string,
  audience: string,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}
