CREATE TABLE IF NOT EXISTS building (
  id INTEGER PRIMARY KEY,
  name TEXT,
  campus TEXT,
  floor_count TEXT,
  fire_grade TEXT,
  manager_id TEXT,
  address_code TEXT
);

CREATE TABLE IF NOT EXISTS fire_device (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  device_code TEXT,
  device_type TEXT,
  floor TEXT,
  location_desc TEXT,
  install_date TEXT,
  status TEXT,
  next_maintenance_at TEXT,
  qualified_component_count INTEGER DEFAULT 0,
  last_writeback_receipt_id TEXT
);

CREATE TABLE IF NOT EXISTS inspection_task (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  inspector_id TEXT,
  plan_date TEXT,
  task_type TEXT,
  status TEXT,
  checklist_version TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_result (
  id INTEGER PRIMARY KEY,
  task_id TEXT,
  device_id TEXT,
  item_code TEXT,
  result_status TEXT,
  measured_value TEXT,
  photo_url TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS hazard_ticket (
  id INTEGER PRIMARY KEY,
  result_id TEXT,
  severity TEXT,
  owner_id TEXT,
  deadline TEXT,
  rectify_status TEXT,
  rectify_note TEXT,
  closed_at TEXT,
  last_receipt_id TEXT
);

-- 整改单登记的隐患条目：回执更换部件/照片按这些条目对账
CREATE TABLE IF NOT EXISTS hazard_registered_item (
  id INTEGER PRIMARY KEY,
  hazard_ticket_id INTEGER,
  item_code TEXT,
  part_name TEXT,
  expected_quantity INTEGER DEFAULT 1,
  photo_required INTEGER DEFAULT 1
);

-- 外委维保商按整改单号报送的维保回执（整单）
CREATE TABLE IF NOT EXISTS maintenance_receipt (
  id INTEGER PRIMARY KEY,
  hazard_ticket_id INTEGER,
  vendor_id TEXT,
  vendor_name TEXT,
  paper_receipt_no TEXT,
  submit_status TEXT,
  reconcile_status TEXT,
  qualified_component_count INTEGER DEFAULT 0,
  mismatch_details TEXT,
  delivery_error TEXT,
  submitted_at TEXT,
  retried_at TEXT,
  reviewed_by TEXT,
  reviewed_note TEXT,
  confirmed_at TEXT
);

-- 回执上的更换部件与照片，逐条与隐患条目匹配
CREATE TABLE IF NOT EXISTS receipt_component (
  id INTEGER PRIMARY KEY,
  maintenance_receipt_id INTEGER,
  item_code TEXT,
  part_name TEXT,
  quantity INTEGER DEFAULT 1,
  photo_url TEXT,
  matched INTEGER DEFAULT 0,
  mismatch_reason TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
