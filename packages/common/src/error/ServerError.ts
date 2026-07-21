import { CustomError } from "./CustomError.js";

export class ServerError extends CustomError {
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message, statusCode, details);
    this.name = "ServerError";
  }
}
