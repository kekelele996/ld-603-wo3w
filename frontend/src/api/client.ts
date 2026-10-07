import type { UserRole } from "../constants/UserRole";

const ROLE_STORAGE_KEY = "fire-inspect.role";
const USER_ID_STORAGE_KEY = "fire-inspect.user-id";

export function getCurrentRole(): UserRole {
  const role = (localStorage.getItem(ROLE_STORAGE_KEY) || "SUPERVISOR") as UserRole;
  return role;
}

export function setCurrentRole(role: UserRole) {
  localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function getCurrentUserId(): number {
  return Number(localStorage.getItem(USER_ID_STORAGE_KEY) || "20");
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("x-role", getCurrentRole());
  headers.set("x-user-id", String(getCurrentUserId()));
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, { ...init, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const error = new Error(body?.message || `请求失败：${res.status}`);
    (error as unknown as { code: string }).code = body?.code || "REQUEST_FAILED";
    throw error;
  }
  return body as T;
}
