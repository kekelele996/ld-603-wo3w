import type { MaintenanceReceipt, ReceiptPart } from "../types/MaintenanceReceipt";

export const createDefaultReceiptPart = (overrides: Partial<ReceiptPart> = {}): ReceiptPart => ({
  item_code: "" as never,
  part_name: "" as never,
  quantity: 1 as never,
  photo_urls: [] as never,
  ...overrides
});

export const createDefaultMaintenanceReceipt = (
  overrides: Partial<MaintenanceReceipt> = {}
): MaintenanceReceipt => ({
  id: 0 as never,
  ticket_id: 1 as never,
  vendor_id: 0 as never,
  vendor_name: "" as never,
  submitted_at: "" as never,
  status: "SUBMITTED" as never,
  attempts: 1 as never,
  last_error: "" as never,
  reconcile_detail: [] as never,
  review_note: "" as never,
  reviewed_by: 0 as never,
  reviewed_at: "" as never,
  qualified_part_count: 0 as never,
  parts: [] as never,
  ...overrides
});

export const createMaintenanceReceiptForm = createDefaultMaintenanceReceipt;
export const createMaintenanceReceiptResponse = createDefaultMaintenanceReceipt;
