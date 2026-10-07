import { create } from "zustand";
import {
  listMaintenanceReceipt,
  listReconcileQueue,
  reportMaintenanceReceipt,
  retryMaintenanceReceipt,
  reviewMaintenanceReceipt
} from "../api/MaintenanceReceipt";
import type { MaintenanceReceipt, MaintenanceReceiptInput } from "../types/MaintenanceReceipt";

type State = {
  rows: MaintenanceReceipt[];
  queue: MaintenanceReceipt[];
  loading: boolean;
  message: string;
  load: () => Promise<void>;
  loadQueue: () => Promise<void>;
  report: (payload: MaintenanceReceiptInput) => Promise<void>;
  retry: (receiptId: number, deliveryStatus: "OK" | "FAIL", components?: MaintenanceReceiptInput["components"]) => Promise<void>;
  confirm: (receiptId: number, note: string) => Promise<void>;
  reject: (receiptId: number, note: string) => Promise<void>;
};

async function run(set: (partial: Partial<State>) => void, task: () => Promise<unknown>) {
  set({ loading: true, message: "" });
  try {
    await task();
  } catch (error) {
    set({ message: (error as Error).message });
  } finally {
    set({ loading: false });
  }
}

export const useMaintenanceReceiptStore = create<State>((set, get) => ({
  rows: [],
  queue: [],
  loading: false,
  message: "",
  async load() {
    set({ loading: true });
    set({ rows: await listMaintenanceReceipt(), loading: false });
  },
  async loadQueue() {
    set({ loading: true });
    set({ queue: await listReconcileQueue(), loading: false });
  },
  report(payload) {
    return run(set, async () => {
      await reportMaintenanceReceipt(payload);
      await get().load();
      set({ message: "回执已整单报送" });
    });
  },
  retry(receiptId, deliveryStatus, components) {
    return run(set, async () => {
      await retryMaintenanceReceipt(receiptId, { delivery_status: deliveryStatus, components });
      await get().load();
      set({ message: deliveryStatus === "OK" ? "整单重试送达成功" : "整单重试仍失败" });
    });
  },
  confirm(receiptId, note) {
    return run(set, async () => {
      await reviewMaintenanceReceipt(receiptId, { action: "confirm", note });
      await get().load();
      set({ message: "已确认，合格部件数写回设备档案并关单" });
    });
  },
  reject(receiptId, note) {
    return run(set, async () => {
      await reviewMaintenanceReceipt(receiptId, { action: "reject", note });
      await get().load();
      set({ message: "已退回维保商，整改单保持未关闭" });
    });
  }
}));
