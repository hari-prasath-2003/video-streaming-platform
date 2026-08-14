import { CustomError } from "./CustomError.js";

export class NotFoundError extends CustomError {
  constructor(message: string, statusCode: number = 404, details?: any) {
    super(message, statusCode, details);
    this.name = "NotFoundError";
  }
}
