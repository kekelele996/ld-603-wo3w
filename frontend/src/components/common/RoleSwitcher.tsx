import { useRoleStore } from "../../stores/RoleStore";
import type { Role } from "../../types/Role";

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "inspector", label: "巡检员" },
  { value: "vendor", label: "维保商" },
  { value: "property_manager", label: "物业主管" },
  { value: "auditor", label: "审计员（只读）" }
];

// 路由守卫/按钮显隐共用：切换后写请求携带对应 x-role
export function RoleSwitcher() {
  const role = useRoleStore((s) => s.user.role);
  const setRole = useRoleStore((s) => s.setRole);
  return (
    <label className="role-switcher">
      当前视角
      <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
