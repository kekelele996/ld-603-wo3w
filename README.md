# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。外委维保商的**维保回执按整改单号线上报送**，回执上的更换部件与照片与整改单登记的隐患条目逐项自动对账，配不上的进对账队列由物业主管复核；**确认前不关单，确认后合格部件数写回设备档案**。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 回执对账业务规则（新增）

1. 巡检与整改各自独立记录；维保商必须**按整改单号**报送回执（`POST /api/maintenance-receipt/submit`）。
2. 回执的更换部件与照片与整改单 `hazard_items` 逐条比对：部件名称一致、数量不少于登记数量、要求照片的条目必须带照片；缺项、多项、数量不足、照片缺失都算"配不上"。
3. 配不上的回执挂**对账队列**（`PENDING_REVIEW`，`GET /api/maintenance-receipt/queue`），等物业主管复核。
4. **确认前不关单**：整改单没有 `CONFIRMED` 回执前，关单接口返回 409；物业主管可确认或驳回（驳回须填意见，整改单退回整改中）。
5. 确认后把**合格部件数**（配得上条目的登记数量之和）累加写回设备档案 `qualified_part_count`，并关闭整改单（`closed_at`）。
6. 回执报送失败落 `SUBMIT_FAILED`，只允许**按整单重试**（`POST /api/maintenance-receipt/{id}/retry`），成功前整改单一律按未关闭算。
7. **审计员只读**：`auditor` 角色对任何 POST 写操作返回 403 `RBAC_DENIED`，审计日志只提供查询。

### 角色与接口

| 接口 | 巡检员 | 维保商 | 物业主管 | 审计员 |
|---|---|---|---|---|
| GET 回执/整改单/设备/审计日志 | ✔ | ✔ | ✔ | ✔ |
| POST 回执报送 / 整单重试 | ✘ | ✔ | ✔ | ✘（403） |
| POST 复核确认 / 驳回 | ✘ | ✘ | ✔ | ✘（403） |
| POST 整改单关单 | ✘ | ✘ | ✔（须回执已确认） | ✘ |

前端左下角可切换四种视角；审计员视角下写操作按钮统一置灰（`router/WriteGuard.tsx`）。

## 访问地址或 CLI 示例

前端：<http://localhost:20103>（左侧"回执对账"/"隐患整改"/"审计日志"）

后端健康检查：<http://localhost:21103/health>

```bash
# 维保商报回执（部件对不上 -> 对账队列）
curl -X POST http://localhost:21103/api/maintenance-receipt/submit \
  -H "Content-Type: application/json" -H "x-role: vendor" \
  -d '{"ticket_id":2,"vendor_name":"安泰消防维保","parts":[{"item_code":"HZ-101","part_name":"烟感探头","quantity":1,"photo_urls":["/mock/1.png"]}]}'

# 物业主管复核确认（写回合格部件数并关单）
curl -X POST http://localhost:21103/api/maintenance-receipt/3/confirm \
  -H "Content-Type: application/json" -H "x-role: property_manager" -d '{"note":"复核通过"}'

# 审计员写操作被拒
curl -X POST http://localhost:21103/api/maintenance-receipt/3/confirm \
  -H "x-role: auditor" -H "Content-Type: application/json" -d '{"note":""}'
# {"code":"RBAC_DENIED","message":"role denied"}
```

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：`cd backend && pip install -r requirements.txt && uvicorn src.main:app --reload --port 8000`，接口统一挂在 `/api`，角色通过请求头 `x-role`（inspector/vendor/property_manager/auditor）传入。

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

回执对账纵切涉及的关键文件：

- 后端：`models/maintenance_receipt.py`、`models/audit_log.py`、`types/maintenance_receipt_payload.py`、`constructors/maintenance_receipt_factory.py`、`repositories/maintenance_receipt_repository.py`、`services/maintenance_receipt_service.py`（对账核心 `_reconcile`）、`controllers/maintenance_receipt_controller.py`、`routes/maintenance_receipt_routes.py`、`middlewares/rbac_dependency.py`、`utils/audit.py`、`constants/receipt_status.py`、`constants/rectify_status.py`
- 前端：`pages/ReconciliationPage.tsx`、`pages/HazardsPage.tsx`、`pages/AuditPage.tsx`、`api/MaintenanceReceipt.ts`、`stores/MaintenanceReceiptStore.ts`、`stores/RoleStore.ts`、`components/common/ReconcileStatusCard.tsx`、`components/common/RoleSwitcher.tsx`、`router/WriteGuard.tsx`
- 数据库：`maintenance_receipt`、`receipt_part`、`reconcile_line`、`hazard_item` 表，`fire_device.qualified_part_count`、`hazard_ticket.closed_at/device_id`

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `fire-inspect`
- `FRONTEND_PORT`: 前端端口，默认 `20103`
- `BACKEND_PORT`: 后端端口，默认 `21103`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据
- `JWT_SECRET`: JWT 签名密钥

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: constants/DeviceType、types/DeviceType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- InspectionStatus: constants/InspectionStatus、types/InspectionStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HazardSeverity: constants/HazardSeverity、types/HazardSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ReceiptStatus（新增）: 前端 `constants/ReceiptStatus.ts`（文案/筛选/`formatReceiptStatus`）、`types/MaintenanceReceipt.ts`、`components/common/ReconcileStatusCard.tsx`、`pages/ReconciliationPage.tsx`；后端 `constants/receipt_status.py`、`services/maintenance_receipt_service.py`、`constructors/maintenance_receipt_factory.py`；数据库 `maintenance_receipt.status`。
- RectifyStatus（新增）: 前端 `constants/RectifyStatus.ts`、`utils/formatters.ts`、`pages/HazardsPage.tsx`；后端 `constants/rectify_status.py`、`services/hazard_ticket_service.py`；数据库 `hazard_ticket.rectify_status`。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；新增"回执状态"一个值需要同步前后端常量、类型、构造器、对账服务、状态徽标、状态文案、日志模板与 README。一次回执确认会串联 `maintenance_receipt → hazard_ticket(closed_at) → fire_device(qualified_part_count) → audit_log` 四处数据。

## License

MIT
