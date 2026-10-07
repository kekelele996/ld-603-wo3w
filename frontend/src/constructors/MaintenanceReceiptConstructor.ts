import type { MaintenanceReceipt, ReceiptComponentInput } from "../types/MaintenanceReceipt";

export const createDefaultReceiptComponent =
  (overrides: Partial<ReceiptComponentInput> = {}): ReceiptComponentInput => ({
    item_code: "",
    part_name: "",
    quantity: 1,
    photo_url: "",
    ...overrides
  });

export const createDefaultMaintenanceReceipt =
  (overrides: Partial<MaintenanceReceipt> = {}): MaintenanceReceipt => ({
    id: 1 as never,
    hazard_ticket_id: 1 as never,
    vendor_id: 1 as never,
    vendor_name: "",
    paper_receipt_no: "",
    submit_status: "SUBMITTED",
    reconcile_status: "PENDING_MATCH",
    components: [],
    mismatch_details: [],
    qualified_component_count: 0,
    delivery_error: "",
    submitted_at: "",
    retried_at: "",
    reviewed_by: null,
    reviewed_note: "",
    confirmed_at: "",
    ...overrides
  });

export const createMaintenanceReceiptForm = createDefaultMaintenanceReceipt;
export const createMaintenanceReceiptResponse = createDefaultMaintenanceReceipt;
