import { StatusBadge } from "./StatusBadge";
import { formatReceiptStatus } from "../../utils/formatters";
import type { MaintenanceReceipt } from "../../types/MaintenanceReceipt";

// 隐患页与回执对账页共用：回执对账状态 + 合格部件数
export function ReconcileStatusCard({ receipt }: { receipt?: MaintenanceReceipt }) {
  if (!receipt) {
    return <div className="shared-widget"><strong>回执对账</strong><StatusBadge value="WAIT_RECEIPT" /></div>;
  }
  return (
    <div className="shared-widget">
      <strong>回执对账 #{receipt.id}</strong>
      <StatusBadge value={receipt.status} />
      <span className="muted">{formatReceiptStatus(receipt.status)}</span>
      <span className="muted">合格部件 {receipt.qualified_part_count} 件 · 第 {receipt.attempts} 次报送</span>
    </div>
  );
}
