export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const badRequest = (message = "Invalid input") =>
  new AppError(400, "BAD_REQUEST", message);

export const unauthorized = (message = "Authentication required") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "Forbidden") => new AppError(403, "FORBIDDEN", message);

export const notFound = (message = "Resource not found") =>
  new AppError(404, "NOT_FOUND", message);

export const conflict = (message = "Resource already exists") =>
  new AppError(409, "CONFLICT", message);
