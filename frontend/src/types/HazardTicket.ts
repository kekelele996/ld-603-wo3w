export interface HazardItem {
  item_code: string;
  part_name: string;
  required_quantity: number;
  photo_required: boolean;
}

export interface HazardTicket {
  id: number;
  result_id: number;
  device_id: number;
  severity: string;
  owner_id: number;
  deadline: string;
  rectify_status: string;
  rectify_note: string;
  closed_at: string;
  hazard_items: HazardItem[];
}
