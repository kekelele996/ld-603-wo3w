// 整改单状态，需与后端 constants/rectify_status.py 保持一致
export const RECTIFY_STATUS = [
  "PENDING_RECTIFY",
  "RECTIFYING",
  "PENDING_RECONCILE",
  "RECONCILED"
] as const;

export type RectifyStatusValue = (typeof RECTIFY_STATUS)[number];

export const RectifyStatusText: Record<string, string> = {
  PENDING_RECTIFY: "待整改",
  RECTIFYING: "整改中",
  PENDING_RECONCILE: "待回执对账",
  RECONCILED: "对账确认已关闭"
};
