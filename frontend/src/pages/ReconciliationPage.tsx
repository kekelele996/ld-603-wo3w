import { useEffect, useMemo, useState } from "react";
import { useMaintenanceReceiptStore } from "../stores/MaintenanceReceiptStore";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import {
  useRoleStore,
  selectCanWrite,
  selectIsManager,
  selectIsVendor
} from "../stores/RoleStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { WriteGuard } from "../router/WriteGuard";
import { formatDate, formatReceiptStatus } from "../utils/formatters";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { MaintenanceReceipt, ReceiptPart } from "../types/MaintenanceReceipt";
import type { HazardTicket } from "../types/HazardTicket";

function ReceiptSubmitForm({ onDone }: { onDone: (msg: string) => void }) {
  const tickets = useHazardTicketStore((s) => s.rows);
  const submit = useMaintenanceReceiptStore((s) => s.submit);
  const openTickets = tickets.filter((ticket) => !ticket.closed_at);

  const [ticketId, setTicketId] = useState<number>(openTickets[0]?.id ?? 0);
  const [vendorName, setVendorName] = useState("安泰消防维保");
  const [partsText, setPartsText] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [error, setError] = useState("");

  const selectedTicket: HazardTicket | undefined = openTickets.find((ticket) => ticket.id === Number(ticketId));

  useEffect(() => {
    if (selectedTicket) {
      setPartsText(selectedTicket.hazard_items
        .map((item) => `${item.item_code}|${item.part_name}|${item.required_quantity}|/mock/${item.item_code}.png`)
        .join("\n"));
    }
  }, [selectedTicket?.id]);

  const parseParts = (): ReceiptPart[] =>
    partsText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
      const [item_code, part_name, quantity, ...photos] = line.split("|").map((cell) => cell.trim());
      return {
        item_code,
        part_name,
        quantity: Number(quantity) || 0,
        photo_urls: photos.filter(Boolean)
      };
    });

  const handleSubmit = async () => {
    setError("");
    try {
      const receipt = await submit({
        ticket_id: Number(ticketId),
        vendor_name: vendorName,
        parts: parseParts(),
        simulate_failure: simulateFailure
      });
      onDone(`回执 #${receipt.id} 已报送，对账结果：${formatReceiptStatus(receipt.status)}`);
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(code && ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]
        ? ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]
        : (err as Error).message);
    }
  };

  if (openTickets.length === 0) return <EmptyState title="没有待回执的整改单" />;

  return (
    <div className="panel">
      <h2>维保商报送回执（按整改单号）</h2>
      <div className="form-row">
        <label>整改单号
          <select value={ticketId} onChange={(e) => setTicketId(Number(e.target.value))}>
            {openTickets.map((ticket) => <option key={ticket.id} value={ticket.id}>#{ticket.id} {ticket.rectify_note}</option>)}
          </select>
        </label>
        <label>维保商
          <input value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
        </label>
      </div>
      {selectedTicket && (
        <p className="muted">
          登记隐患条目：
          {selectedTicket.hazard_items.map((item) =>
            ` ${item.item_code}=${item.part_name}×${item.required_quantity}${item.photo_required ? "(需照片)" : ""}`).join("；")}
        </p>
      )}
      <p className="muted">每行一条更换部件：条目编码|部件名称|数量|照片URL（多条照片再用 | 追加）</p>
      <textarea rows={4} value={partsText} onChange={(e) => setPartsText(e.target.value)} />
      <label className="checkbox">
        <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} />
        模拟纸质单录入报送失败（落待重试，成功前按未关闭算）
      </label>
      {error && <p className="inline-message error">{error}</p>}
      <WriteGuard>
        <button className="btn primary" onClick={handleSubmit}>报送回执</button>
      </WriteGuard>
    </div>
  );
}

function ReconcileDetailTable({ receipt }: { receipt: MaintenanceReceipt }) {
  if (receipt.reconcile_detail.length === 0) return <p className="muted">报送失败，尚无对账明细，请整单重试。</p>;
  return (
    <table className="detail-table">
      <thead>
        <tr><th>条目编码</th><th>登记部件</th><th>回执部件</th><th>需/报数量</th><th>照片</th><th>对账</th><th>不配原因</th></tr>
      </thead>
      <tbody>
        {receipt.reconcile_detail.map((line) => (
          <tr key={line.item_code} className={line.matched ? "ok" : "bad"}>
            <td><code>{line.item_code}</code></td>
            <td>{line.expected_part_name}</td>
            <td>{line.receipt_part_name || "—"}</td>
            <td>{line.required_quantity} / {line.receipt_quantity}</td>
            <td>{line.photo_ok ? "有" : "缺"}</td>
            <td>{line.matched ? "相符" : "配不上"}</td>
            <td>{line.reason || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReviewActions({ receipt, onDone }: { receipt: MaintenanceReceipt; onDone: (msg: string) => void }) {
  const confirm = useMaintenanceReceiptStore((s) => s.confirm);
  const reject = useMaintenanceReceiptStore((s) => s.reject);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const reviewable = receipt.status === "MATCHED" || receipt.status === "PENDING_REVIEW";

  if (!reviewable) {
    return <p className="muted">复核意见：{receipt.review_note || "—"}（{formatDate(receipt.reviewed_at)}）</p>;
  }

  const act = async (action: "confirm" | "reject") => {
    setError("");
    try {
      if (action === "confirm") {
        await confirm(receipt.id, note);
        onDone(`回执 #${receipt.id} 已确认，合格部件 ${receipt.qualified_part_count} 件已写回设备档案并关单`);
      } else {
        if (!note.trim()) {
          setError(ERROR_MESSAGES.VALIDATION_FAILED + "：驳回必须填写意见");
          return;
        }
        await reject(receipt.id, note);
        onDone(`回执 #${receipt.id} 已驳回，整改单退回整改中`);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="review-box">
      <textarea rows={2} placeholder="物业主管复核意见（驳回必填）" value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <p className="inline-message error">{error}</p>}
      <div className="btn-row">
        <WriteGuard><button className="btn primary" onClick={() => act("confirm")}>复核确认（写回合格部件数并关单）</button></WriteGuard>
        <WriteGuard><button className="btn danger" onClick={() => act("reject")}>驳回退回</button></WriteGuard>
      </div>
    </div>
  );
}

function ReceiptCard({ receipt, onDone }: { receipt: MaintenanceReceipt; onDone: (msg: string) => void }) {
  const retry = useMaintenanceReceiptStore((s) => s.retry);
  const tickets = useHazardTicketStore((s) => s.rows);
  const devices = useFireDeviceStore((s) => s.rows);
  const canWrite = useRoleStore(selectCanWrite);
  const isManager = useRoleStore(selectIsManager);
  const isVendor = useRoleStore(selectIsVendor);
  const [busy, setBusy] = useState(false);

  const ticket = tickets.find((item) => item.id === receipt.ticket_id);
  const deviceCode = devices.find((d) => d.id === ticket?.device_id)?.device_code ?? `设备#${ticket?.device_id ?? "-"}`;

  const handleRetry = async () => {
    setBusy(true);
    try {
      const next = await retry(receipt.id);
      onDone(`已按整单重试，新回执 #${next.id}：${formatReceiptStatus(next.status)}`);
    } catch (err) {
      onDone((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`panel receipt-card ${receipt.status.toLowerCase().replace(/_/g, "-")}`}>
      <div className="ticket-head">
        <strong>回执 #{receipt.id} · 整改单 #{receipt.ticket_id}</strong>
        <StatusBadge value={receipt.status} />
      </div>
      <p className="muted">
        {receipt.vendor_name} · {deviceCode} · 报送于 {formatDate(receipt.submitted_at)} · 第 {receipt.attempts} 次
      </p>
      {receipt.last_error && <p className="inline-message error">{receipt.last_error}</p>}

      <ReconcileDetailTable receipt={receipt} />

      {receipt.status === "SUBMIT_FAILED" && canWrite && (isVendor || isManager) && (
        <WriteGuard>
          <button className="btn warning" disabled={busy} onClick={handleRetry}>
            {busy ? "整单重试中…" : "按整单重试（成功前按未关闭算）"}
          </button>
        </WriteGuard>
      )}

      {isManager && <ReviewActions receipt={receipt} onDone={onDone} />}
    </article>
  );
}

export function ReconciliationPage() {
  const { rows, queue, load, loadQueue } = useMaintenanceReceiptStore();
  const loadTickets = useHazardTicketStore((s) => s.load);
  const loadDevices = useFireDeviceStore((s) => s.load);
  const isVendor = useRoleStore(selectIsVendor);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void load();
    void loadQueue();
    void loadTickets();
    void loadDevices();
  }, [load, loadQueue, loadTickets, loadDevices]);

  const failedCount = useMemo(() => rows.filter((r) => r.status === "SUBMIT_FAILED").length, [rows]);
  const confirmedCount = useMemo(() => rows.filter((r) => r.status === "CONFIRMED").length, [rows]);

  return (
    <section className="reconcile-page">
      <header className="panel">
        <h2>维保回执对账</h2>
        <p className="muted">
          维保商按整改单号报回执；回执更换部件与照片须与整改单登记隐患条目逐项相配，配不上的先进对账队列等物业主管复核，
          确认前不关单；确认后合格部件数写回设备档案。报送失败按整单重试，成功前按未关闭算。
        </p>
      </header>

      <section className="metrics">
        <StatCard label="对账队列待复核" value={queue.length} />
        <StatCard label="报送失败待重试" value={failedCount} />
        <StatCard label="已确认关单" value={confirmedCount} />
      </section>

      {message && <p className="inline-message">{message}</p>}

      {(isVendor) && <ReceiptSubmitForm onDone={(msg) => { setMessage(msg); void load(); void loadQueue(); }} />}

      <h3>全部回执</h3>
      {rows.length === 0 && <EmptyState title="暂无维保回执" />}
      {rows.map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} onDone={(msg) => { setMessage(msg); void load(); void loadQueue(); }} />
      ))}
    </section>
  );
}
