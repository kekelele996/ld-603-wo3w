import { apiRequest } from "./client";
import type { AuditLog } from "../types/AuditLog";

export async function listAuditLog(): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>("/api/audit-log");
}
