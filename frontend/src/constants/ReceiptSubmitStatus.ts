export const ReceiptSubmitStatus = ["SUBMITTED", "SUBMIT_FAILED"] as const;
export type ReceiptSubmitStatus = (typeof ReceiptSubmitStatus)[number];
export const ReceiptSubmitStatusText: Record<ReceiptSubmitStatus, string> = {
  SUBMITTED: "报送成功",
  SUBMIT_FAILED: "报送失败"
};
