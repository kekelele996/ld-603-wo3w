export const mockData = {
  "building": [
    {
      "id": 1,
      "name": "1号研发楼",
      "campus": "江北园区",
      "floor_count": "6",
      "fire_grade": "一级",
      "manager_id": 1,
      "address_code": "320100"
    },
    {
      "id": 2,
      "name": "2号综合楼",
      "campus": "江北园区",
      "floor_count": "8",
      "fire_grade": "一级",
      "manager_id": 2,
      "address_code": "320100"
    },
    {
      "id": 3,
      "name": "3号仓储楼",
      "campus": "江南园区",
      "floor_count": "3",
      "fire_grade": "二级",
      "manager_id": 3,
      "address_code": "320102"
    }
  ],
  "fireDevice": [
    {
      "id": 1,
      "building_id": 1,
      "device_code": "HY-2026-001",
      "device_type": "HYDRANT",
      "floor": "1F",
      "location_desc": "东侧楼梯间",
      "install_date": "2024-03-11",
      "status": "NORMAL",
      "next_maintenance_at": "2026-11-01",
      "qualified_component_count": 3,
      "last_writeback_receipt_id": 1
    },
    {
      "id": 2,
      "building_id": 2,
      "device_code": "YG-2026-014",
      "device_type": "SMOKE_DETECTOR",
      "floor": "3F",
      "location_desc": "走廊东侧吊顶",
      "install_date": "2024-05-08",
      "status": "HAZARD_PENDING",
      "next_maintenance_at": "2026-10-20",
      "qualified_component_count": 0,
      "last_writeback_receipt_id": null
    },
    {
      "id": 3,
      "building_id": 3,
      "device_code": "PL-2026-027",
      "device_type": "SPRINKLER",
      "floor": "2F",
      "location_desc": "货架区上方管网",
      "install_date": "2023-12-02",
      "status": "HAZARD_PENDING",
      "next_maintenance_at": "2026-10-15",
      "qualified_component_count": 0,
      "last_writeback_receipt_id": null
    }
  ],
  "inspectionTask": [
    {
      "id": 1,
      "building_id": 1,
      "inspector_id": 1,
      "plan_date": "2026-09-20T09:00:00Z",
      "task_type": "HYDRANT",
      "status": "REVIEWED",
      "checklist_version": "v3.1",
      "finished_at": "2026-09-20T11:00:00Z"
    },
    {
      "id": 2,
      "building_id": 2,
      "inspector_id": 2,
      "plan_date": "2026-09-25T09:00:00Z",
      "task_type": "SMOKE_DETECTOR",
      "status": "REVIEWED",
      "checklist_version": "v3.1",
      "finished_at": "2026-09-25T10:30:00Z"
    },
    {
      "id": 3,
      "building_id": 3,
      "inspector_id": 1,
      "plan_date": "2026-10-02T09:00:00Z",
      "task_type": "SPRINKLER",
      "status": "REVIEWED",
      "checklist_version": "v3.1",
      "finished_at": "2026-10-02T11:10:00Z"
    }
  ],
  "inspectionResult": [
    {
      "id": 1,
      "task_id": 1,
      "device_id": 1,
      "item_code": "HK-001",
      "result_status": "ABNORMAL",
      "measured_value": "压力不足",
      "photo_url": "/mock/result-1.png",
      "note": "灭火器压力表失效，消火栓密封圈老化"
    },
    {
      "id": 2,
      "task_id": 2,
      "device_id": 2,
      "item_code": "XG-001",
      "result_status": "ABNORMAL",
      "measured_value": "无响应",
      "photo_url": "/mock/result-2.png",
      "note": "烟感探测器故障需更换"
    },
    {
      "id": 3,
      "task_id": 3,
      "device_id": 3,
      "item_code": "PL-001",
      "result_status": "ABNORMAL",
      "measured_value": "渗漏",
      "photo_url": "/mock/result-3.png",
      "note": "喷淋头破损 2 个"
    }
  ],
  "hazardTicket": [
    {
      "id": 1,
      "result_id": 1,
      "severity": "HIGH",
      "owner_id": 10,
      "deadline": "2026-10-10",
      "rectify_status": "CLOSED",
      "rectify_note": "回执对账通过，已关单",
      "closed_at": "2026-09-30T16:00:00Z",
      "registered_items": [
        { "item_code": "HK-001", "part_name": "灭火器压力表", "expected_quantity": 1, "photo_required": true },
        { "item_code": "HK-002", "part_name": "消火栓密封圈", "expected_quantity": 2, "photo_required": true }
      ],
      "last_receipt_id": 1
    },
    {
      "id": 2,
      "result_id": 2,
      "severity": "MEDIUM",
      "owner_id": 10,
      "deadline": "2026-10-12",
      "rectify_status": "RECONCILE_PENDING",
      "rectify_note": "回执部件与登记隐患条目不匹配，挂对账队列",
      "closed_at": "",
      "registered_items": [
        { "item_code": "XG-001", "part_name": "烟感探测器", "expected_quantity": 1, "photo_required": true }
      ],
      "last_receipt_id": 2
    },
    {
      "id": 3,
      "result_id": 3,
      "severity": "HIGH",
      "owner_id": 10,
      "deadline": "2026-10-09",
      "rectify_status": "OPEN",
      "rectify_note": "维保回执报送失败，按未关闭处理",
      "closed_at": "",
      "registered_items": [
        { "item_code": "PL-001", "part_name": "喷淋头", "expected_quantity": 2, "photo_required": true }
      ],
      "last_receipt_id": 3
    }
  ],
  "maintenanceReceipt": [
    {
      "id": 1,
      "hazard_ticket_id": 1,
      "vendor_id": 10,
      "vendor_name": "安泰消防维保",
      "paper_receipt_no": "WB-20260930-01",
      "submit_status": "SUBMITTED",
      "reconcile_status": "CONFIRMED",
      "components": [
        { "item_code": "HK-001", "part_name": "灭火器压力表", "quantity": 1, "photo_url": "/mock/receipt-1-1.png", "matched": true, "mismatch_reason": "" },
        { "item_code": "HK-002", "part_name": "消火栓密封圈", "quantity": 2, "photo_url": "/mock/receipt-1-2.png", "matched": true, "mismatch_reason": "" }
      ],
      "mismatch_details": [],
      "qualified_component_count": 3,
      "delivery_error": "",
      "submitted_at": "2026-09-30T14:00:00Z",
      "retried_at": "",
      "reviewed_by": 20,
      "reviewed_note": "部件、数量、照片与隐患条目一致，确认通过",
      "confirmed_at": "2026-09-30T16:00:00Z"
    },
    {
      "id": 2,
      "hazard_ticket_id": 2,
      "vendor_id": 10,
      "vendor_name": "安泰消防维保",
      "paper_receipt_no": "WB-20261003-02",
      "submit_status": "SUBMITTED",
      "reconcile_status": "MISMATCH_PENDING_REVIEW",
      "components": [
        { "item_code": "XG-001", "part_name": "感温探测器", "quantity": 1, "photo_url": "", "matched": false, "mismatch_reason": "PART_NAME_MISMATCH;PHOTO_MISSING" }
      ],
      "mismatch_details": [
        { "item_code": "XG-001", "reason": "PART_NAME_MISMATCH", "expected": "烟感探测器", "actual": "感温探测器" },
        { "item_code": "XG-001", "reason": "PHOTO_MISSING", "expected": "/receipt photo", "actual": "" }
      ],
      "qualified_component_count": 0,
      "delivery_error": "",
      "submitted_at": "2026-10-03T10:00:00Z",
      "retried_at": "",
      "reviewed_by": null,
      "reviewed_note": "",
      "confirmed_at": ""
    },
    {
      "id": 3,
      "hazard_ticket_id": 3,
      "vendor_id": 10,
      "vendor_name": "安泰消防维保",
      "paper_receipt_no": "WB-20261005-03",
      "submit_status": "SUBMIT_FAILED",
      "reconcile_status": "PENDING_MATCH",
      "components": [
        { "item_code": "PL-001", "part_name": "喷淋头", "quantity": 2, "photo_url": "/mock/receipt-3-1.png", "matched": false, "mismatch_reason": "" }
      ],
      "mismatch_details": [],
      "qualified_component_count": 0,
      "delivery_error": "回执报送超时（HTTP 504），整单未送达",
      "submitted_at": "2026-10-05T09:30:00Z",
      "retried_at": "",
      "reviewed_by": null,
      "reviewed_note": "",
      "confirmed_at": ""
    }
  ]
} as const;
