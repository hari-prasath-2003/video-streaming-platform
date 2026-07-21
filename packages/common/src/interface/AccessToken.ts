import { type JWTPayload } from "jose";

export interface AccessToken extends JWTPayload {
  email: string;
  uid: string;
  role: string;
}
