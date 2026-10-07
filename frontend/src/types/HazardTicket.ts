export interface RegisteredHazardItem {
  item_code: string;
  part_name: string;
  expected_quantity: number;
  photo_required: boolean;
}

export interface HazardTicket {
  id: number;
  result_id: number;
  severity: string;
  owner_id: number;
  deadline: string;
  rectify_status: string;
  rectify_note: string;
  closed_at: string;
  registered_items: RegisteredHazardItem[];
  last_receipt_id: number | null;
}
