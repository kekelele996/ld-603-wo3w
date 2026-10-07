import { useMemo } from "react";
import { RectifyStatusText } from "../constants/RectifyStatus";
import { ReceiptReconcileStatusText } from "../constants/ReceiptReconcileStatus";
import { ReceiptSubmitStatusText } from "../constants/ReceiptSubmitStatus";
import type { MaintenanceReceipt } from "../types/MaintenanceReceipt";

export function useReceiptReconcile(receipts: MaintenanceReceipt[]) {
  const stats = useMemo(() => {
    const pick = (status: string) => receipts.filter((row) => row.reconcile_status === status).length;
    return {
      total: receipts.length,
      submittedFailed: receipts.filter((row) => row.submit_status === "SUBMIT_FAILED").length,
      queued: pick("MISMATCH_PENDING_REVIEW"),
      matched: pick("MATCHED"),
      confirmed: pick("CONFIRMED"),
      rejected: pick("REJECTED")
    };
  }, [receipts]);

  const ticketStatusText = (status: string) =>
    RectifyStatusText[status as keyof typeof RectifyStatusText] ?? status;
  const submitStatusText = (status: string) =>
    ReceiptSubmitStatusText[status as keyof typeof ReceiptSubmitStatusText] ?? status;
  const reconcileStatusText = (status: string) =>
    ReceiptReconcileStatusText[status as keyof typeof ReceiptReconcileStatusText] ?? status;

  return { stats, ticketStatusText, submitStatusText, reconcileStatusText };
}
