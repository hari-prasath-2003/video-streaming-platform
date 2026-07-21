import { CustomError } from "./CustomError.js";

export class AuthError extends CustomError {
  constructor(message: string, statusCode: number = 401, details?: any) {
    super(message, statusCode, details);
    this.name = "AuthError";
  }
}
