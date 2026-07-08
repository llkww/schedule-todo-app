const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const TOKEN_KEY = "schedule.todo.token";

export type ApiError = {
  code: string;
  message: string;
};

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.status = status;
    this.code = error.code;
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new ApiRequestError(response.status, {
      code: payload?.error?.code ?? "REQUEST_FAILED",
      message: payload?.error?.message ?? "请求失败",
    });
  }

  return payload.data as T;
}
