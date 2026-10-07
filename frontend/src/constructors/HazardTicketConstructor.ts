import type { HazardTicket, HazardItem } from "../types/HazardTicket";

export const createDefaultHazardItem = (overrides: Partial<HazardItem> = {}): HazardItem => ({
  item_code: "HZ-001" as never,
  part_name: "待更换部件" as never,
  required_quantity: 1 as never,
  photo_required: true as never,
  ...overrides
});

export const createDefaultHazardTicket = (overrides: Partial<HazardTicket> = {}): HazardTicket => ({
  id: 1 as never,
  result_id: 1 as never,
  device_id: 1 as never,
  severity: "HIGH" as never,
  owner_id: 1 as never,
  deadline: "2026-10-20" as never,
  rectify_status: "RECTIFYING" as never,
  rectify_note: "rectify note 1" as never,
  closed_at: "" as never,
  hazard_items: [createDefaultHazardItem()] as never,
  ...overrides
});

export const createHazardTicketForm = createDefaultHazardTicket;
export const createHazardTicketResponse = createDefaultHazardTicket;
