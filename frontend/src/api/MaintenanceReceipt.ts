import { apiRequest } from "./client";
import { mockData } from "../mocks/seedData";
import type { MaintenanceReceipt, MaintenanceReceiptPayload } from "../types/MaintenanceReceipt";

const endpoint = "/api/maintenance-receipt";

export async function listMaintenanceReceipt(status?: string): Promise<MaintenanceReceipt[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return await apiRequest<MaintenanceReceipt[]>(`${endpoint}${query}`);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [...(mockData.maintenanceReceipt as unknown as MaintenanceReceipt[])]
      .filter((row) => !status || row.status === status);
  }
}

export function listReconcileQueue(): Promise<MaintenanceReceipt[]> {
  return listMaintenanceReceipt("PENDING_REVIEW");
}

// 维保商按整改单号报回执；报送失败由调用方引导"整单重试"
export async function submitMaintenanceReceipt(payload: MaintenanceReceiptPayload): Promise<MaintenanceReceipt> {
  return apiRequest<MaintenanceReceipt>(`${endpoint}/submit`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// 失败后按整单重试，成功前按没关闭算
export function retryMaintenanceReceipt(receiptId: number): Promise<MaintenanceReceipt> {
  return apiRequest<MaintenanceReceipt>(`${endpoint}/${receiptId}/retry`, { method: "POST" });
}

export function confirmMaintenanceReceipt(receiptId: number, note: string): Promise<MaintenanceReceipt> {
  return apiRequest<MaintenanceReceipt>(`${endpoint}/${receiptId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}

export function rejectMaintenanceReceipt(receiptId: number, note: string): Promise<MaintenanceReceipt> {
  return apiRequest<MaintenanceReceipt>(`${endpoint}/${receiptId}/reject`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}
