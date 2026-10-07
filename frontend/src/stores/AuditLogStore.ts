import { create } from "zustand";
import { listAuditLog } from "../api/AuditLog";
import type { AuditLog } from "../types/AuditLog";

type State = { rows: AuditLog[]; load: () => Promise<void> };

export const useAuditLogStore = create<State>((set) => ({
  rows: [],
  async load() {
    set({ rows: await listAuditLog() });
  }
}));
