export const UserRole = ["INSPECTOR", "VENDOR", "SUPERVISOR", "AUDITOR", "ADMIN"] as const;
export type UserRole = (typeof UserRole)[number];
export const UserRoleText: Record<UserRole, string> = {
  INSPECTOR: "巡检员",
  VENDOR: "外委维保商",
  SUPERVISOR: "物业主管",
  AUDITOR: "审计员(只读)",
  ADMIN: "管理员"
};
