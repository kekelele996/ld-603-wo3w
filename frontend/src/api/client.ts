import { useRoleStore } from "../stores/RoleStore";

// 统一请求入口：禁止硬编码 localhost，写请求自动携带 x-role 供后端 RBAC 判定
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const role = useRoleStore.getState().user.role;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-role": role,
    ...((options.headers as Record<string, string>) ?? {})
  };
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return Promise.reject(Object.assign(new Error(body.message || res.statusText), {
      code: body.code,
      status: res.status
    }));
  }
  return (await res.json()) as T;
}
