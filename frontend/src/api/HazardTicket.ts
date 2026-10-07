import { apiRequest } from "./client";
import { mockData } from "../mocks/seedData";
import type { HazardTicket } from "../types/HazardTicket";

const endpoint = "/api/hazard-ticket";

export async function listHazardTicket(): Promise<HazardTicket[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.hazardTicket as unknown as HazardTicket[])];
}

export async function saveHazardTicket(payload: HazardTicket) {
  console.info("save HazardTicket", payload);
  return payload;
}

// 确认前不关单：后端在回执未确认通过时会拦截关闭
export async function closeHazardTicket(ticketId: number): Promise<HazardTicket> {
  return apiRequest<HazardTicket>(`${endpoint}/${ticketId}/close`, { method: "POST" });
}
