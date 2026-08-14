import sessionRepository from "../repository/SessionRepository.js";
import { verifyHash } from "../utils/VerifyHash.js";
import { hashPassword } from "../utils/HashPassword.js";
import { verifyJwtRefreshToken } from "../utils/VerifyJwtRefreshToken.js";
import { generateJwtToken } from "../utils/GenerateJwtToken.js";
import {
  AuthError,
  ConflictError,
  RefreshToken,
  ValidationError,
} from "@video-streaming/common";
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

  /**
   * The credential half of the account: everything user-service does not own.
   */
  async getAccount(userId: string): Promise<any> {
    const user = await this.sessionRepository.getUserById(userId);

    if (!user) {
      throw new AuthError("User not found", 404);
    }

    return {
      uid: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new ValidationError(
        "Both currentPassword and newPassword are required.",
      );
    }

    if (newPassword.length < 8) {
      throw new ValidationError(
        "New password must be at least 8 characters long.",
      );
    }

    const user = await this.sessionRepository.getUserById(userId);

    if (!user) {
      throw new AuthError("User not found", 404);
    }

    if (!(await verifyHash(user.passwordHash, currentPassword))) {
      throw new AuthError("Current password is incorrect", 401);
    }

    if (await verifyHash(user.passwordHash, newPassword)) {
      throw new ValidationError(
        "New password must be different from the current one.",
      );
    }

    await this.sessionRepository.updatePassword(
      userId,
      await hashPassword(newPassword),
    );
  }

  async changeEmail(
    userId: string,
    currentPassword: string,
    newEmail: string,
  ): Promise<any> {
    const email = newEmail?.trim().toLowerCase();

    if (!currentPassword || !email) {
      throw new ValidationError(
        "Both currentPassword and newEmail are required.",
      );
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new ValidationError("New email is not a valid address.");
    }

    const user = await this.sessionRepository.getUserById(userId);

    if (!user) {
      throw new AuthError("User not found", 404);
    }

    // Re-authenticate before letting the login identifier change.
    if (!(await verifyHash(user.passwordHash, currentPassword))) {
      throw new AuthError("Current password is incorrect", 401);
    }

    const existing = await this.sessionRepository.getUserByEmail(email);

    if (existing && existing.id !== userId) {
      throw new ConflictError("Email already in use");
    }

    const updated = await this.sessionRepository.updateEmail(userId, email);

    return {
      uid: updated.id,
      email: updated.email,
      role: updated.role,
      emailVerified: updated.emailVerified,
    };
  }

  async deleteAccount(userId: string, currentPassword: string): Promise<void> {
    const user = await this.sessionRepository.getUserById(userId);

    if (!user) {
      throw new AuthError("User not found", 404);
    }

    if (!(await verifyHash(user.passwordHash, currentPassword))) {
      throw new AuthError("Current password is incorrect", 401);
    }

    // Sessions cascade with the user row.
    await this.sessionRepository.deleteUser(userId);
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
