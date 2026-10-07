from src.constants.user_role import UserRole


async def auth_middleware(request, call_next):
    role = request.headers.get("x-role", "ADMIN").upper()
    role = role if role in UserRole else "ADMIN"
    request.state.user = {
        "id": int(request.headers.get("x-user-id", "0") or 0) or 1,
        "role": role,
        "name": request.headers.get("x-user-name", f"{role.lower()}-1"),
    }
    return await call_next(request)
