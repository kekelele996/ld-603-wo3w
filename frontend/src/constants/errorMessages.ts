export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  HAZARD_TICKET_NOT_FOUND: "未找到对应的隐患整改单",
  RECEIPT_NOT_FOUND: "未找到对应的维保回执",
  RECEIPT_RETRY_TARGET_FAILED: "只有报送失败的整单回执才允许按整单重试",
  RECEIPT_NOT_REVIEWABLE: "该回执当前不在物业主管可复核状态",
  HAZARD_TICKET_NOT_CLOSABLE: "回执尚未确认通过，整改单不能关闭",
  AUDITOR_READ_ONLY: "审计员为只读角色，禁止任何写操作"
} as const;
