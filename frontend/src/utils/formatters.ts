export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const MISMATCH_REASON_TEXT: Record<string, string> = {
  ITEM_NOT_REGISTERED: "回执部件未在整改单隐患条目中登记",
  PART_NAME_MISMATCH: "更换部件名称与登记条目不一致",
  QUANTITY_MISMATCH: "更换数量与登记数量不一致",
  PHOTO_MISSING: "回执缺少更换部件照片",
  ITEM_NOT_REPORTED: "登记的隐患条目未在回执中上报"
};

export const formatMismatchReason = (value: string) =>
  value.split(";").map((code) => MISMATCH_REASON_TEXT[code] ?? code).join("；");

