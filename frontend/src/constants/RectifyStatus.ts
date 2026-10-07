export const RectifyStatus = ["OPEN", "RECEIPT_MATCHED", "RECONCILE_PENDING", "CLOSED"] as const;
export type RectifyStatus = (typeof RectifyStatus)[number];
export const RectifyStatusText: Record<RectifyStatus, string> = {
  OPEN: "待整改/回执未确认",
  RECEIPT_MATCHED: "回执匹配待确认",
  RECONCILE_PENDING: "挂对账队列",
  CLOSED: "已关闭"
};
