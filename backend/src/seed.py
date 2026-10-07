seed = {
  "building": [
    {
      "id": 1,
      "name": "name 1",
      "campus": "campus 1",
      "floor_count": "floor count 1",
      "fire_grade": "fire grade 1",
      "manager_id": 1,
      "address_code": "address code 1"
    },
    {
      "id": 2,
      "name": "name 2",
      "campus": "campus 2",
      "floor_count": "floor count 2",
      "fire_grade": "fire grade 2",
      "manager_id": 2,
      "address_code": "address code 2"
    },
    {
      "id": 3,
      "name": "name 3",
      "campus": "campus 3",
      "floor_count": "floor count 3",
      "fire_grade": "fire grade 3",
      "manager_id": 3,
      "address_code": "address code 3"
    }
  ],
  "fireDevice": [
    {
      "id": 1,
      "building_id": 1,
      "device_code": "XF-SB-0001",
      "device_type": "HYDRANT",
      "floor": "1F",
      "location_desc": "1号楼大厅东侧消火栓",
      "install_date": "2026-06-11T09:00:00Z",
      "status": "IN_PROGRESS",
      "next_maintenance_at": "2026-06-11T09:00:00Z",
      "qualified_part_count": 0
    },
    {
      "id": 2,
      "building_id": 2,
      "device_code": "XF-SB-0002",
      "device_type": "SMOKE_DETECTOR",
      "floor": "3F",
      "location_desc": "2号楼3层走廊烟感",
      "install_date": "2026-06-12T09:00:00Z",
      "status": "SUBMITTED",
      "next_maintenance_at": "2026-06-12T09:00:00Z",
      "qualified_part_count": 0
    },
    {
      "id": 3,
      "building_id": 3,
      "device_code": "XF-SB-0003",
      "device_type": "SPRINKLER",
      "floor": "B1",
      "location_desc": "3号楼地下车库喷淋头",
      "install_date": "2026-06-13T09:00:00Z",
      "status": "PLANNED",
      "next_maintenance_at": "2026-06-13T09:00:00Z",
      "qualified_part_count": 0
    }
  ],
  "inspectionTask": [
    {
      "id": 1,
      "building_id": 1,
      "inspector_id": 1,
      "plan_date": "2026-06-11T09:00:00Z",
      "task_type": "HYDRANT",
      "status": "IN_PROGRESS",
      "checklist_version": "checklist version 1",
      "finished_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "building_id": 2,
      "inspector_id": 2,
      "plan_date": "2026-06-12T09:00:00Z",
      "task_type": "SMOKE_DETECTOR",
      "status": "SUBMITTED",
      "checklist_version": "checklist version 2",
      "finished_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "building_id": 3,
      "inspector_id": 3,
      "plan_date": "2026-06-13T09:00:00Z",
      "task_type": "SPRINKLER",
      "status": "PLANNED",
      "checklist_version": "checklist version 3",
      "finished_at": "2026-06-13T09:00:00Z"
    }
  ],
  "inspectionResult": [
    {
      "id": 1,
      "task_id": 1,
      "device_id": 1,
      "item_code": "item code 1",
      "result_status": "IN_PROGRESS",
      "measured_value": "measured value 1",
      "photo_url": "/mock/photo_url-1.png",
      "note": "note 1"
    },
    {
      "id": 2,
      "task_id": 2,
      "device_id": 2,
      "item_code": "item code 2",
      "result_status": "SUBMITTED",
      "measured_value": "measured value 2",
      "photo_url": "/mock/photo_url-2.png",
      "note": "note 2"
    },
    {
      "id": 3,
      "task_id": 3,
      "device_id": 3,
      "item_code": "item code 3",
      "result_status": "PLANNED",
      "measured_value": "measured value 3",
      "photo_url": "/mock/photo_url-3.png",
      "note": "note 3"
    }
  ],
  "hazardTicket": [
    {
      "id": 1,
      "result_id": 1,
      "device_id": 1,
      "severity": "HIGH",
      "owner_id": 1,
      "deadline": "2026-10-20",
      "rectify_status": "PENDING_RECONCILE",
      "rectify_note": "消火栓水带老化、阀门锈蚀，需外委更换",
      "closed_at": "",
      "hazard_items": [
        {"item_code": "HZ-001", "part_name": "消防水带", "required_quantity": 2, "photo_required": True},
        {"item_code": "HZ-002", "part_name": "阀门", "required_quantity": 1, "photo_required": True}
      ]
    },
    {
      "id": 2,
      "result_id": 2,
      "device_id": 2,
      "severity": "MEDIUM",
      "owner_id": 2,
      "deadline": "2026-10-25",
      "rectify_status": "RECTIFYING",
      "rectify_note": "烟感探测器故障误报，需更换探头",
      "closed_at": "",
      "hazard_items": [
        {"item_code": "HZ-101", "part_name": "烟感探头", "required_quantity": 1, "photo_required": True}
      ]
    },
    {
      "id": 3,
      "result_id": 3,
      "device_id": 3,
      "severity": "LOW",
      "owner_id": 3,
      "deadline": "2026-11-01",
      "rectify_status": "PENDING_RECTIFY",
      "rectify_note": "喷淋头防尘罩缺失",
      "closed_at": "",
      "hazard_items": [
        {"item_code": "HZ-201", "part_name": "喷淋头防尘罩", "required_quantity": 3, "photo_required": False}
      ]
    }
  ],
  "maintenanceReceipt": [
    {
      "id": 1,
      "ticket_id": 1,
      "vendor_id": 9001,
      "vendor_name": "安泰消防维保",
      "submitted_at": "2026-10-06T10:00:00Z",
      "status": "SUBMIT_FAILED",
      "attempts": 1,
      "last_error": "回执报送失败，需按整单重试",
      "reconcile_detail": [],
      "review_note": "",
      "reviewed_by": 0,
      "reviewed_at": "",
      "qualified_part_count": 0,
      "parts": [
        {"item_code": "HZ-001", "part_name": "消防水带", "quantity": 2, "photo_urls": ["/mock/receipt-1-hz001.png"]},
        {"item_code": "HZ-002", "part_name": "阀门", "quantity": 1, "photo_urls": ["/mock/receipt-1-hz002.png"]}
      ]
    }
  ],
  "auditLog": [
    {
      "id": 1,
      "actor": "vendor:9001",
      "action": "MaintenanceReceipt.submit",
      "target_type": "MaintenanceReceipt",
      "target_id": "1",
      "created_at": "2026-10-06T10:00:00Z"
    }
  ]
}
