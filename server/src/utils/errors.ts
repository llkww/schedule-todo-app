export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const badRequest = (message = "输入无效") =>
  new AppError(400, "BAD_REQUEST", message);

export const unauthorized = (message = "请先登录") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "无权访问") => new AppError(403, "FORBIDDEN", message);

export const notFound = (message = "资源不存在") =>
  new AppError(404, "NOT_FOUND", message);

export const conflict = (message = "资源已存在") =>
  new AppError(409, "CONFLICT", message);
