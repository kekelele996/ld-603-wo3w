import { apiRequest } from "./client";
import { mockData } from "../mocks/seedData";
import type { MaintenanceReceipt, MaintenanceReceiptInput } from "../types/MaintenanceReceipt";

const endpoint = "/api/maintenance-receipt";

export async function listMaintenanceReceipt(filters: {
  ticket_id?: number;
  reconcile_status?: string;
  submit_status?: string;
} = {}): Promise<MaintenanceReceipt[]> {
  const query = new URLSearchParams();
  if (filters.ticket_id != null) query.set("ticket_id", String(filters.ticket_id));
  if (filters.reconcile_status) query.set("reconcile_status", filters.reconcile_status);
  if (filters.submit_status) query.set("submit_status", filters.submit_status);
  try {
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<MaintenanceReceipt[]>(`${endpoint}${suffix}`);
  } catch {
    return [...(mockData.maintenanceReceipt as unknown as MaintenanceReceipt[])];
  }
}

export async function listReconcileQueue(): Promise<MaintenanceReceipt[]> {
  try {
    return await apiRequest<MaintenanceReceipt[]>(`${endpoint}/queue`);
  } catch {
    return (mockData.maintenanceReceipt as unknown as MaintenanceReceipt[]).filter(
      (row) => row.reconcile_status === "MISMATCH_PENDING_REVIEW"
    );
  }
}

export async function reportMaintenanceReceipt(
  payload: MaintenanceReceiptInput
): Promise<MaintenanceReceipt> {
  return apiRequest<MaintenanceReceipt>(endpoint, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function retryMaintenanceReceipt(
  receiptId: number,
  payload: { delivery_status?: "OK" | "FAIL"; components?: MaintenanceReceiptInput["components"] }
): Promise<MaintenanceReceipt> {
  return apiRequest<MaintenanceReceipt>(`${endpoint}/${receiptId}/retry`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function reviewMaintenanceReceipt(
  receiptId: number,
  payload: { action: "confirm" | "reject"; note: string }
): Promise<MaintenanceReceipt> {
  return apiRequest<MaintenanceReceipt>(`${endpoint}/${receiptId}/review`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
