WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


async def audit_log_middleware(request, call_next):
    # 写操作必须留痕；业务写操作在 service 内通过 record_audit 落 audit_log 表，
    # 中间件负责兜底打印请求轨迹，审计员只读，不产生业务写日志。
    if request.method in WRITE_METHODS:
        print("audit-write", request.method, request.url.path,
              "role=", getattr(request.state, "user", {}).get("role"))
    else:
        print("audit", request.method, request.url.path)
    return await call_next(request)
