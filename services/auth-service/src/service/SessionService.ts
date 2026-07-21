import sessionRepository from "../repository/SessionRepository.js";
import { verifyHash } from "../utils/VerifyHash.js";
import { hashPassword } from "../utils/HashPassword.js";
import { verifyJwtRefreshToken } from "../utils/VerifyJwtRefreshToken.js";
import { generateJwtToken } from "../utils/GenerateJwtToken.js";
import { AuthError, RefreshToken } from "@video-streaming/common";
import { JWTExpired, JWTInvalid } from "jose/errors";

export class SessionService {
  private sessionRepository = sessionRepository;

  async loginUser(email: string, password: string): Promise<any> {
    const user = await this.sessionRepository.getUserByEmail(email);
    if (!user) {
      throw new AuthError("User not found", 404);
    }
    // Add password verification logic here
    if (!(await verifyHash(user.passwordHash, password))) {
      throw new AuthError("Invalid password", 401);
    }

    const accessToken = await generateJwtToken(
      { email: user.email, uid: user.id, role: user.role },
      process.env.JWT_SECRET!,
      "15m",
      "auth-service",
      "gateway",
    );

    const refreshToken = await generateJwtToken(
      { uid: user.id, jid: "refresh-token-id" },
      process.env.JWT_SECRET!,
      "7d",
      "auth-service",
      "auth-service",
    );
    return {
      user: { email: user.email, uid: user.id },
      accessToken,
      refreshToken,
    };
  }

  async signUpUser(email: string, password: string): Promise<any> {
    const existingUser = await this.sessionRepository.getUserByEmail(email);
    if (existingUser) {
      throw new AuthError("User already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const newUser = await this.sessionRepository.createUser(
      email,
      passwordHash,
    );

    const accessToken = await generateJwtToken(
      { email: newUser.email, uid: newUser.id, role: newUser.role },
      process.env.JWT_SECRET!,
      "15m",
      "auth-service",
      "gateway",
    );

    const refreshToken = await generateJwtToken(
      { uid: newUser.id, jid: "refresh-token-id" },
      process.env.JWT_SECRET!,
      "7d",
      "auth-service",
      "auth-service",
    );
    return {
      user: { email: newUser.email, uid: newUser.id },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const payload: RefreshToken = await verifyJwtRefreshToken(
        refreshToken,
        process.env.JWT_SECRET!,
      );
      const user = await this.sessionRepository.getUserById(payload.uid);

      if (!user) {
        throw new AuthError("User not found", 404);
      }

      const accessToken = await generateJwtToken(
        { email: user.email, uid: user.id, role: user.role },
        process.env.JWT_SECRET!,
        "15m",
        "auth-service",
        "gateway",
      );

      const newRefreshToken = await generateJwtToken(
        { uid: user.id, jid: "refresh-token-id" },
        process.env.JWT_SECRET!,
        "7d",
        "auth-service",
        "auth-service",
      );
      return {
        user: { email: user.email, uid: user.id },
        accessToken,
        newRefreshToken,
      };
    } catch (error) {
      if (error instanceof JWTExpired) {
        throw new AuthError("Refresh token has expired");
      } else if (error instanceof JWTInvalid) {
        throw new AuthError("Invalid refresh token");
      }
      throw error;
    }
  }
}
