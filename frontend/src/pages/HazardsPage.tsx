import { useEffect, useMemo, useState } from "react";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useMaintenanceReceiptStore } from "../stores/MaintenanceReceiptStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useRoleStore, selectIsManager } from "../stores/RoleStore";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { ReconcileStatusCard } from "../components/common/ReconcileStatusCard";
import { EmptyState } from "../components/common/EmptyState";
import { WriteGuard } from "../router/WriteGuard";
import { formatRectifyStatus, formatClosed } from "../utils/formatters";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { HazardTicket } from "../types/HazardTicket";

export function HazardsPage() {
  const { rows, load, close } = useHazardTicketStore();
  const receiptRows = useMaintenanceReceiptStore((s) => s.rows);
  const loadReceipts = useMaintenanceReceiptStore((s) => s.load);
  const devices = useFireDeviceStore((s) => s.rows);
  const loadDevices = useFireDeviceStore((s) => s.load);
  const isManager = useRoleStore(selectIsManager);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    void load();
    void loadReceipts();
    void loadDevices();
  }, [load, loadReceipts, loadDevices]);

  const receiptByTicket = useMemo(() => {
    const map = new Map<number, (typeof receiptRows)[number]>();
    for (const receipt of receiptRows) map.set(receipt.ticket_id, receipt);
    return map;
  }, [receiptRows]);

  const deviceName = (ticket: HazardTicket) =>
    devices.find((device) => device.id === ticket.device_id)?.device_code ?? `设备#${ticket.device_id}`;

  const handleClose = async (ticket: HazardTicket) => {
    setFeedback("");
    try {
      await close(ticket.id);
      setFeedback(`整改单 #${ticket.id} 已在回执对账确认后关闭`);
    } catch (err) {
      const code = (err as { code?: string }).code;
      setFeedback(code && ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]
        ? `#${ticket.id}：${ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]}`
        : `#${ticket.id}：${(err as Error).message}`);
    }
  };

  return (
    <section className="hazards-page">
      <header className="panel">
        <h2>隐患整改单</h2>
        <p className="muted">关单前置：外委维保回执须按整改单号报送，部件与照片对账通过并经物业主管复核确认后才允许关单。</p>
        {feedback && <p className="inline-message">{feedback}</p>}
      </header>

      {rows.length === 0 && <EmptyState title="暂无整改单" />}

      <div className="ticket-grid">
        {rows.map((ticket) => {
          const receipt = receiptByTicket.get(ticket.id);
          const closed = Boolean(ticket.closed_at);
          return (
            <article key={ticket.id} className={`panel ticket-card ${closed ? "closed" : "open"}`}>
              <div className="ticket-head">
                <strong>整改单 #{ticket.id}</strong>
                <HazardSeverityTag title="隐患分级" value={ticket.severity} />
                <StatusBadge value={ticket.rectify_status} />
              </div>
              <p className="muted">{formatRectifyStatus(ticket.rectify_status)} · 期限 {ticket.deadline} · {deviceName(ticket)}</p>
              <p>{ticket.rectify_note}</p>

              <div className="subpanel">
                <h3>登记隐患条目（对账基准）</h3>
                <ul className="item-list">
                  {ticket.hazard_items.map((item) => (
                    <li key={item.item_code}>
                      <code>{item.item_code}</code> {item.part_name} × {item.required_quantity}
                      {item.photo_required && <span className="tag">需照片</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <ReconcileStatusCard receipt={receipt} />
              <TimelineList title="关单状态" value={closed ? "CONFIRMED" : "WAIT_RECONCILE"} />
              <p className="muted">{formatClosed(ticket.closed_at)}</p>

              {isManager && (
                <WriteGuard>
                  <button className="btn" disabled={closed} onClick={() => handleClose(ticket)}>
                    {closed ? "已关闭" : "复验关单（需对账确认）"}
                  </button>
                </WriteGuard>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
