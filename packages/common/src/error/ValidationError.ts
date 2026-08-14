import { CustomError } from "./CustomError.js";

export class ValidationError extends CustomError {
  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message, statusCode, details);
    this.name = "ValidationError";
  }
}
