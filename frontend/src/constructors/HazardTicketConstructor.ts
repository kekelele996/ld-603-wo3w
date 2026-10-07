import type { HazardTicket } from "../types/HazardTicket";

export const createDefaultHazardTicket = (overrides: Partial<HazardTicket> = {}): HazardTicket => ({
  id: 1 as never,
  result_id: 1 as never,
  severity: "severity 1" as never,
  owner_id: 1 as never,
  deadline: "deadline 1" as never,
  rectify_status: "OPEN" as never,
  rectify_note: "" as never,
  closed_at: "" as never,
  registered_items: [],
  last_receipt_id: null,
  ...overrides
});

export const createHazardTicketForm = createDefaultHazardTicket;
export const createHazardTicketResponse = createDefaultHazardTicket;
