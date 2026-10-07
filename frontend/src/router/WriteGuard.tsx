import type { ReactNode } from "react";
import { useRoleStore, selectCanWrite } from "../stores/RoleStore";

// 审计员只读守卫：写操作按钮统一包一层，只读视角直接禁用并提示
export function WriteGuard({ children, title = "审计员只读，禁止写操作" }: { children: ReactNode; title?: string }) {
  const canWrite = useRoleStore(selectCanWrite);
  if (canWrite) return <>{children}</>;
  return <span className="write-guard" title={title} aria-disabled="true">{children}</span>;
}
