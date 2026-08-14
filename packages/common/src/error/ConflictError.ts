import { CustomError } from "./CustomError.js";

export class ConflictError extends CustomError {
  constructor(message: string, statusCode: number = 409, details?: any) {
    super(message, statusCode, details);
    this.name = "ConflictError";
  }
}
