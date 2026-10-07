export interface ReceiptComponent {
  item_code: string;
  part_name: string;
  quantity: number;
  photo_url: string;
  matched: boolean;
  mismatch_reason: string;
}

export interface ReceiptMismatchDetail {
  item_code: string;
  reason: string;
  expected: string | number;
  actual: string | number;
}

export interface MaintenanceReceipt {
  id: number;
  hazard_ticket_id: number;
  vendor_id: number;
  vendor_name: string;
  paper_receipt_no: string;
  submit_status: string;
  reconcile_status: string;
  components: ReceiptComponent[];
  mismatch_details: ReceiptMismatchDetail[];
  qualified_component_count: number;
  delivery_error: string;
  submitted_at: string;
  retried_at: string;
  reviewed_by: number | null;
  reviewed_note: string;
  confirmed_at: string;
}

export interface ReceiptComponentInput {
  item_code: string;
  part_name: string;
  quantity: number;
  photo_url: string;
}

export interface MaintenanceReceiptInput {
  hazard_ticket_id: number;
  vendor_id: number;
  vendor_name?: string;
  paper_receipt_no?: string;
  delivery_status?: "OK" | "FAIL";
  components: ReceiptComponentInput[];
}
