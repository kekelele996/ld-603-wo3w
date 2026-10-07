import { useEffect, useMemo, useState } from "react";
import { UserRole, UserRoleText } from "../constants/UserRole";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { useMaintenanceReceiptStore } from "../stores/MaintenanceReceiptStore";
import { useReceiptReconcile } from "../hooks/useReceiptReconcile";
import { getCurrentRole, setCurrentRole } from "../api/client";
import type { MaintenanceReceipt } from "../types/MaintenanceReceipt";

const FILTERS = [
  { key: "ALL", label: "全部回执" },
  { key: "MISMATCH_PENDING_REVIEW", label: "对账队列" },
  { key: "MATCHED", label: "待主管确认" },
  { key: "SUBMIT_FAILED", label: "报送失败" },
  { key: "CONFIRMED", label: "已确认" }
] as const;

export function ReconcilePage() {
  const { rows, message, load, retry, confirm, reject } = useMaintenanceReceiptStore();
  const { stats, submitStatusText, reconcileStatusText } = useReceiptReconcile(rows);
  const [role, setRole] = useState<UserRole>(getCurrentRole());
  const [filter, setFilter] = useState<string>("ALL");
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  const isAuditor = role === "AUDITOR";

  const visibleRows = useMemo(() => {
    if (filter === "ALL") return rows;
    if (filter === "SUBMIT_FAILED") return rows.filter((row) => row.submit_status === "SUBMIT_FAILED");
    return rows.filter((row) => row.reconcile_status === filter);
  }, [rows, filter]);

  const changeRole = (next: UserRole) => {
    setRole(next);
    setCurrentRole(next);
  };

  const canRetry = (row: MaintenanceReceipt) =>
    !isAuditor && (role === "VENDOR" || role === "SUPERVISOR" || role === "ADMIN") &&
    row.submit_status === "SUBMIT_FAILED";
  const canReview = (row: MaintenanceReceipt) =>
    !isAuditor && (role === "SUPERVISOR" || role === "ADMIN") &&
    row.submit_status === "SUBMITTED" &&
    (row.reconcile_status === "MATCHED" || row.reconcile_status === "MISMATCH_PENDING_REVIEW");

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>维保回执对账</h1>
        </div>
        <label className="role-switch">
          当前角色
          <select value={role} onChange={(event) => changeRole(event.target.value as UserRole)}>
            {UserRole.map((value) => (
              <option key={value} value={value}>{UserRoleText[value]}</option>
            ))}
          </select>
        </label>
      </section>

      {isAuditor && <section className="panel auditor-tip">审计员账号只读：可查看回执与对账结果，不能报送、重试、确认或关单。</section>}
      {message && <section className="panel message-bar">{message}</section>}

      <section className="metrics">
        <StatCard label="回执总数" value={stats.total} />
        <StatCard label="挂对账队列" value={stats.queued} />
        <StatCard label="报送失败待整单重试" value={stats.submittedFailed} />
        <StatCard label="待主管确认" value={stats.matched} />
        <StatCard label="已确认回写" value={stats.confirmed} />
      </section>

      <section className="filter-tabs">
        {FILTERS.map((item) => (
          <button key={item.key} className={filter === item.key ? "active" : ""} onClick={() => setFilter(item.key)}>
            {item.label}
          </button>
        ))}
      </section>

      <section className="workbench reconcile-list">
        {visibleRows.map((row) => (
          <article key={row.id} className="panel receipt-card">
            <header className="receipt-head">
              <div>
                <strong>回执 #{row.id}</strong>
                <span className="muted">整改单 #{row.hazard_ticket_id}</span>
                <span className="muted">{row.vendor_name} · 纸质单号 {row.paper_receipt_no}</span>
              </div>
              <div className="badges">
                <StatusBadge value={row.submit_status === "SUBMIT_FAILED" ? "SUBMIT_FAILED" : row.submit_status} />
                <StatusBadge value={row.reconcile_status} />
              </div>
            </header>

            <p className="status-line">
              报送：{submitStatusText(row.submit_status)} · 对账：{reconcileStatusText(row.reconcile_status)} ·
              合格部件数：<strong>{row.qualified_component_count}</strong>
            </p>

            {row.delivery_error && <p className="error-text">报送异常：{row.delivery_error}（成功前按未关闭处理）</p>}

            <div className="table parts">
              {row.components.map((component, index) => (
                <div key={`${component.item_code}-${index}`} className="row part-row">
                  <strong>{component.item_code}</strong>
                  <span>{component.part_name} × {component.quantity}</span>
                  <span>{component.photo_url ? "照片已附" : "缺照片"}</span>
                  <StatusBadge value={component.matched ? "MATCHED" : "MISMATCH"} />
                </div>
              ))}
            </div>

            {row.mismatch_details.length > 0 && (
              <ul className="mismatch-list">
                {row.mismatch_details.map((detail, index) => (
                  <li key={index}>
                    {detail.item_code}：{detail.reason}（期望：{String(detail.expected) || "—"}，实际：{String(detail.actual) || "—"}）
                  </li>
                ))}
              </ul>
            )}

            {row.reviewed_note && <p className="muted">主管复核：{row.reviewed_note}</p>}

            <footer className="actions">
              {canRetry(row) && (
                <button onClick={() => retry(row.id, "OK")}>整单重试送达</button>
              )}
              {canReview(row) && (
                <>
                  <input
                    placeholder="复核意见"
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                  />
                  <button onClick={() => confirm(row.id, reviewNote)}>确认并关单回写</button>
                  <button className="danger" onClick={() => reject(row.id, reviewNote)}>退回维保商</button>
                </>
              )}
              {isAuditor && <span className="muted">{ERROR_MESSAGES.AUDITOR_READ_ONLY}</span>}
            </footer>
          </article>
        ))}
      </section>
    </main>
  );
}
