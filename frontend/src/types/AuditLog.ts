export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
}
