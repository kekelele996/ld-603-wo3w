import { create } from "zustand";
import {
  listMaintenanceReceipt,
  listReconcileQueue,
  submitMaintenanceReceipt,
  retryMaintenanceReceipt,
  confirmMaintenanceReceipt,
  rejectMaintenanceReceipt
} from "../api/MaintenanceReceipt";
import type { MaintenanceReceipt, MaintenanceReceiptPayload } from "../types/MaintenanceReceipt";

type State = {
  rows: MaintenanceReceipt[];
  queue: MaintenanceReceipt[];
  loading: boolean;
  error: string;
  load: (status?: string) => Promise<void>;
  loadQueue: () => Promise<void>;
  submit: (payload: MaintenanceReceiptPayload) => Promise<MaintenanceReceipt>;
  retry: (receiptId: number) => Promise<MaintenanceReceipt>;
  confirm: (receiptId: number, note: string) => Promise<MaintenanceReceipt>;
  reject: (receiptId: number, note: string) => Promise<MaintenanceReceipt>;
};

async function refresh(state: State) {
  await Promise.all([state.load(), state.loadQueue()]);
}

export const useMaintenanceReceiptStore = create<State>((set, get) => ({
  rows: [],
  queue: [],
  loading: false,
  error: "",
  async load(status) {
    set({ loading: true, error: "" });
    try {
      set({ rows: await listMaintenanceReceipt(status), loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },
  async loadQueue() {
    set({ queue: await listReconcileQueue() });
  },
  async submit(payload) {
    const receipt = await submitMaintenanceReceipt(payload);
    await refresh(get());
    return receipt;
  },
  async retry(receiptId) {
    const receipt = await retryMaintenanceReceipt(receiptId);
    await refresh(get());
    return receipt;
  },
  async confirm(receiptId, note) {
    const receipt = await confirmMaintenanceReceipt(receiptId, note);
    await refresh(get());
    return receipt;
  },
  async reject(receiptId, note) {
    const receipt = await rejectMaintenanceReceipt(receiptId, note);
    await refresh(get());
    return receipt;
  }
}));
