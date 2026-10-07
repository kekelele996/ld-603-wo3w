# 角色 -> 允许的写操作集合；审计员不出现在任何写白名单中（只读）
ROLE_PERMISSIONS = {
    "inspector": {"inspection.*", "hazard.create"},
    "vendor": {"receipt.submit", "receipt.retry"},
    "property_manager": {
        "receipt.submit",
        "receipt.retry",
        "receipt.confirm",
        "receipt.reject",
        "hazard.close",
    },
    "auditor": set(),
}


def allow_roles(role: str, action: str) -> bool:
    return action in ROLE_PERMISSIONS.get(role, set())
