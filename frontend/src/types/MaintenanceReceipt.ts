export interface ReceiptPart {
  item_code: string;
  part_name: string;
  quantity: number;
  photo_urls: string[];
}

export interface ReconcileLine {
  item_code: string;
  expected_part_name: string;
  receipt_part_name: string;
  required_quantity: number;
  receipt_quantity: number;
  photo_ok: boolean;
  matched: boolean;
  reason: string;
}

export interface MaintenanceReceipt {
  id: number;
  ticket_id: number;
  vendor_id: number;
  vendor_name: string;
  submitted_at: string;
  status: string;
  attempts: number;
  last_error: string;
  reconcile_detail: ReconcileLine[];
  review_note: string;
  reviewed_by: number;
  reviewed_at: string;
  qualified_part_count: number;
  parts: ReceiptPart[];
}

export interface MaintenanceReceiptPayload {
  ticket_id: number;
  vendor_name: string;
  parts: ReceiptPart[];
  simulate_failure?: boolean;
}
