from datetime import datetime, timezone

from src.seed import seed


def record_audit(actor: str, action: str, target_type: str, target_id) -> dict:
    rows = seed["auditLog"]
    entry = {
        "id": (max((row["id"] for row in rows), default=0) + 1),
        "actor": actor,
        "action": action,
        "target_type": target_type,
        "target_id": str(target_id),
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    rows.append(entry)
    print("audit", entry["action"], entry["target_type"], entry["target_id"], "by", entry["actor"])
    return entry
