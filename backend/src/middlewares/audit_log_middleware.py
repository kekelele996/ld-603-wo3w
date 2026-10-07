WRITE_ACTIONS = {"POST", "PUT", "PATCH", "DELETE"}


async def audit_log_middleware(request, call_next):
    user = getattr(request.state, "user", None)
    if request.method in WRITE_ACTIONS:
        print(
            "audit",
            request.method,
            request.url.path,
            "actor=",
            user.get("role") if user else "anonymous",
            user.get("id") if user else "",
        )
    return await call_next(request)
