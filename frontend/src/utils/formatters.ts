import { RectifyStatusText } from "../constants/RectifyStatus";
import { ReceiptStatusText } from "../constants/ReceiptStatus";

export const formatDate = (value: string) => value ? new Date(value).toLocaleString("zh-CN") : "—";
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatRectifyStatus = (value: string) => RectifyStatusText[value] ?? value;
export const formatReceiptStatus = (value: string) => ReceiptStatusText[value] ?? value;
export const formatClosed = (closedAt: string) => closedAt ? `已关闭 ${formatDate(closedAt)}` : "未关闭（待回执对账确认）";
