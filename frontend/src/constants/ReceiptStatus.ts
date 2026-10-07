// 维保回执对账状态，需与后端 constants/receipt_status.py 保持一致
export const RECEIPT_STATUS = [
  "SUBMIT_FAILED",
  "SUBMITTED",
  "MATCHED",
  "PENDING_REVIEW",
  "CONFIRMED",
  "REJECTED"
] as const;

export type ReceiptStatusValue = (typeof RECEIPT_STATUS)[number];

export const ReceiptStatusText: Record<string, string> = {
  SUBMIT_FAILED: "报送失败待重试",
  SUBMITTED: "已报送",
  MATCHED: "对账相符",
  PENDING_REVIEW: "对账队列待复核",
  CONFIRMED: "复核确认已关单",
  REJECTED: "复核驳回"
};
