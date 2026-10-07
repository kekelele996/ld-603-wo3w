export const ReceiptReconcileStatus = [
  "PENDING_MATCH",
  "MATCHED",
  "MISMATCH_PENDING_REVIEW",
  "CONFIRMED",
  "REJECTED"
] as const;
export type ReceiptReconcileStatus = (typeof ReceiptReconcileStatus)[number];
export const ReceiptReconcileStatusText: Record<ReceiptReconcileStatus, string> = {
  PENDING_MATCH: "待对账",
  MATCHED: "匹配待确认",
  MISMATCH_PENDING_REVIEW: "挂对账队列",
  CONFIRMED: "已确认",
  REJECTED: "已退回"
};
