import { create } from "zustand";
import { listHazardTicket, closeHazardTicket } from "../api/HazardTicket";
import type { HazardTicket } from "../types/HazardTicket";

type State = {
  rows: HazardTicket[];
  loading: boolean;
  load: () => Promise<void>;
  close: (ticketId: number) => Promise<HazardTicket>;
};

export const useHazardTicketStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listHazardTicket(), loading: false });
  },
  async close(ticketId) {
    // 关单请求由后端兜底：回执对账未确认返回 409
    const ticket = await closeHazardTicket(ticketId);
    await get().load();
    return ticket;
  }
}));
