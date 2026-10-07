import { apiRequest } from "./client";
import { mockData } from "../mocks/seedData";
import type { HazardTicket } from "../types/HazardTicket";

const endpoint = "/api/hazard-ticket";

export async function listHazardTicket(): Promise<HazardTicket[]> {
  try {
    return await apiRequest<HazardTicket[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [...(mockData.hazardTicket as unknown as HazardTicket[])];
  }
}

export async function saveHazardTicket(payload: HazardTicket) {
  console.info("save HazardTicket", payload);
  return payload;
}

// 关单：后端校验必须有 CONFIRMED 回执，否则 409（确认前不关单）
export function closeHazardTicket(ticketId: number): Promise<HazardTicket> {
  return apiRequest<HazardTicket>(`${endpoint}/${ticketId}/close`, { method: "POST" });
}
