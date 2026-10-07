import { create } from "zustand";
import type { CurrentUser, Role } from "../types/Role";

// 演示环境：角色通过请求头 x-role 透传给后端 auth_middleware
const STORAGE_KEY = "fire-inspect-role";
const initialRole = (typeof localStorage !== "undefined"
  && (localStorage.getItem(STORAGE_KEY) as Role | null)) || "property_manager";

type RoleState = {
  user: CurrentUser;
  setRole: (role: Role) => void;
};

export const useRoleStore = create<RoleState>((set) => ({
  user: { id: 1, role: initialRole },
  setRole: (role) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, role);
    set({ user: { id: 1, role } });
  }
}));

// 派生选择器：路由守卫与按钮显隐统一用这组，审计员只读
export const selectCanWrite = (s: RoleState) => s.user.role !== "auditor";
export const selectIsManager = (s: RoleState) => s.user.role === "property_manager";
export const selectIsVendor = (s: RoleState) => s.user.role === "vendor";
export const selectIsAuditor = (s: RoleState) => s.user.role === "auditor";
