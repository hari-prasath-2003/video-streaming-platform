import { type JWTPayload } from "jose";

export interface RefreshToken extends JWTPayload {
  uid: string;
  jid: string;
}
