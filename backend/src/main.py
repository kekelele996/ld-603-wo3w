from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from src.constants.error_codes import ERROR_CODES
from src.middlewares.audit_log_middleware import audit_log_middleware
from src.middlewares.auth_middleware import auth_middleware
from src.middlewares.rbac_middleware import is_read_only_request
from src.routes.building_routes import router as building_router
from src.routes.fire_device_routes import router as fire_device_router
from src.routes.inspection_task_routes import router as inspection_task_router
from src.routes.inspection_result_routes import router as inspection_result_router
from src.routes.hazard_ticket_routes import router as hazard_ticket_router
from src.routes.maintenance_receipt_routes import router as maintenance_receipt_router
from src.utils.service_error import ServiceError

app = FastAPI(title="消防设施巡检维保平台")


async def auditor_read_only_middleware(request: Request, call_next):
    if is_read_only_request(request):
        return JSONResponse(
            status_code=403,
            content={"code": ERROR_CODES["AUDITOR_READ_ONLY"], "message": "审计员账号只读，禁止写操作"},
        )
    return await call_next(request)


# Starlette 后注册的中间件更靠近外层，执行顺序为 auth -> audit -> 审计员只读
app.middleware("http")(auditor_read_only_middleware)
app.middleware("http")(audit_log_middleware)
app.middleware("http")(auth_middleware)


@app.exception_handler(ServiceError)
async def service_error_handler(request: Request, exc: ServiceError):
    return JSONResponse(
        status_code=getattr(exc, "status_code", 400),
        content={"code": exc.code, "message": str(exc)},
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "fire-inspect"}


app.include_router(building_router)
app.include_router(fire_device_router)
app.include_router(inspection_task_router)
app.include_router(inspection_result_router)
app.include_router(hazard_ticket_router)
app.include_router(maintenance_receipt_router)
