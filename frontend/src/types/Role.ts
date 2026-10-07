// 与后端 x-role 头一致的四种角色；审计员只读
export type Role = "inspector" | "vendor" | "property_manager" | "auditor";

export interface CurrentUser {
  id: number;
  role: Role;
}
