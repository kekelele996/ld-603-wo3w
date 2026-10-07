from fastapi import FastAPI
from src.middlewares.auth_middleware import auth_middleware
from src.middlewares.audit_log_middleware import audit_log_middleware
from src.routes.building_routes import router as building_router
from src.routes.fire_device_routes import router as fire_device_router
from src.routes.inspection_task_routes import router as inspection_task_router
from src.routes.inspection_result_routes import router as inspection_result_router
from src.routes.hazard_ticket_routes import router as hazard_ticket_router
from src.routes.maintenance_receipt_routes import router as maintenance_receipt_router
from src.routes.audit_log_routes import router as audit_log_router

app = FastAPI(title="消防设施巡检维保平台")
# 后注册的 http 中间件位于更外层：audit 先注册、auth 后注册，
# 保证请求先过认证写入 request.state.user，再过审计留痕
app.middleware("http")(audit_log_middleware)
app.middleware("http")(auth_middleware)

@app.get("/health")
def health():
    return {"status": "ok", "service": "fire-inspect"}

app.include_router(building_router)
app.include_router(fire_device_router)
app.include_router(inspection_task_router)
app.include_router(inspection_result_router)
app.include_router(hazard_ticket_router)
app.include_router(maintenance_receipt_router)
app.include_router(audit_log_router)
