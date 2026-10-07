# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。

## 维保回执对账

巡检与整改各记各的，外委维保回执统一通过「回执对账」收口，取代纸质人工核对：

- 维保商**按整改单号整单报送回执**：`POST /api/maintenance-receipt`，回执携带更换部件（条目编码、部件名、数量、照片）。
- 回执部件/照片按整改单登记的隐患条目（`hazard_ticket.registered_items`）逐条匹配：条目未登记、部件名不符、数量不符、缺照片、登记条目未上报均视为配不上。
- 配得上 → `MATCHED` 待物业主管确认；配不上 → `MISMATCH_PENDING_REVIEW` 挂**对账队列**（`GET /api/maintenance-receipt/queue`），等物业主管复核。
- **确认前不关单**：整改单关闭接口 `POST /api/hazard-ticket/{id}/close` 在没有「已确认」回执时返回 `HAZARD_TICKET_NOT_CLOSABLE`。
- 物业主管 `confirm` 后把**合格部件数写回设备档案**（`fire_device.qualified_component_count`、`last_writeback_receipt_id`）并自动关单；`reject` 则退回维保商、整改单保持打开。
- **回执报送失败按整单重试**：失败回执落 `SUBMIT_FAILED`，成功前整改单一律按未关闭、未对账处理；`POST /api/maintenance-receipt/{id}/retry` 以整单粒度重试。
- **审计员只读**：RBAC 在中间件与路由守卫双层拦截，`AUDITOR` 角色任何写操作返回 `AUDITOR_READ_ONLY`。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Redux Toolkit |
| 后端 | FastAPI + Python 3.11 + SQLAlchemy 2.0 |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

回执对账相关文件以 `maintenance_receipt` 命名（前端为 `MaintenanceReceipt`）：`models / types / constructors / repositories / services / controllers / routes` 七层各一个文件；匹配逻辑集中在 `services/maintenance_receipt_service.py` 的 `match_receipt`，写操作经 `constants/log_templates.py` 的 `MaintenanceReceipt.*` 模板落审计日志。

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `fire-inspect`
- `FRONTEND_PORT`: 前端端口，默认 `20103`
- `BACKEND_PORT`: 后端端口，默认 `21103`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: constants/DeviceType、types/DeviceType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- InspectionStatus: constants/InspectionStatus、types/InspectionStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HazardSeverity: constants/HazardSeverity、types/HazardSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ReceiptSubmitStatus: 后端 constants/receipt_submit_status.py、constructors/maintenance_receipt_factory.py、services/maintenance_receipt_service.py；前端 constants/ReceiptSubmitStatus.ts、constants/statusText.ts、hooks/useReceiptReconcile.ts、pages/ReconcilePage.tsx。
- ReceiptReconcileStatus: 后端 constants/receipt_reconcile_status.py、constructors/maintenance_receipt_factory.py、services/maintenance_receipt_service.py、services/hazard_ticket_service.py；前端 constants/ReceiptReconcileStatus.ts、constants/statusText.ts、api/MaintenanceReceipt.ts、hooks/useReceiptReconcile.ts、pages/ReconcilePage.tsx。
- RectifyStatus: 后端 constants/rectify_status.py、constructors/hazard_ticket_factory.py、services/maintenance_receipt_service.py、services/hazard_ticket_service.py、seed.py；前端 constants/RectifyStatus.ts、constants/statusText.ts、hooks/useReceiptReconcile.ts。
- UserRole: 后端 constants/user_role.py、middlewares/auth_middleware.py、middlewares/rbac_middleware.py、middlewares/guards.py、controllers/maintenance_receipt_controller.py、controllers/hazard_ticket_controller.py；前端 constants/UserRole.ts、constants/statusText.ts、api/client.ts、pages/ReconcilePage.tsx。

### 回执对账实体（MaintenanceReceipt）跨层位置

- 数据表：`database/init.sql` 中 `maintenance_receipt`、`receipt_component`、`hazard_registered_item`，以及 `fire_device.qualified_component_count`、`hazard_ticket.last_receipt_id` 字段。
- 后端：models/maintenance_receipt.py、types/maintenance_receipt_payload.py、constructors/maintenance_receipt_factory.py、repositories/maintenance_receipt_repository.py、services/maintenance_receipt_service.py（匹配/队列/复核/回写）、controllers/maintenance_receipt_controller.py、routes/maintenance_receipt_routes.py。
- 前端：types/MaintenanceReceipt.ts、constructors/MaintenanceReceiptConstructor.ts、api/MaintenanceReceipt.ts、api/client.ts（角色头）、stores/MaintenanceReceiptStore.ts、hooks/useReceiptReconcile.ts、pages/ReconcilePage.tsx、router/routes.ts。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
