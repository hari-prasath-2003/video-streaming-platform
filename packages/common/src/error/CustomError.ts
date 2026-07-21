export class CustomError extends Error {
  name: string;
  statusCode: number;
  message: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
  }
}
