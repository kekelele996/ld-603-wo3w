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
  -- 回执对账经物业主管复核确认后写回的合格更换部件累计数
  qualified_part_count INTEGER DEFAULT 0
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

-- 隐患整改单登记的隐患条目（对账基准）：部件名称、所需数量、是否需照片
CREATE TABLE IF NOT EXISTS hazard_item (
  id INTEGER PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  item_code TEXT NOT NULL,
  part_name TEXT NOT NULL,
  required_quantity INTEGER NOT NULL DEFAULT 1,
  photo_required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS hazard_ticket (
  id INTEGER PRIMARY KEY,
  result_id TEXT,
  device_id TEXT,
  severity TEXT,
  owner_id TEXT,
  deadline TEXT,
  rectify_status TEXT,
  rectify_note TEXT,
  -- 仅在回执对账 CONFIRMED 后写入；确认前不关单
  closed_at TEXT
);

-- 外委维保商按整改单号报送的回执（整单维度，失败按整单重试）
CREATE TABLE IF NOT EXISTS maintenance_receipt (
  id INTEGER PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  vendor_id INTEGER,
  vendor_name TEXT,
  submitted_at TEXT,
  -- SUBMIT_FAILED / SUBMITTED / MATCHED / PENDING_REVIEW / CONFIRMED / REJECTED
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  review_note TEXT,
  reviewed_by INTEGER,
  reviewed_at TEXT,
  qualified_part_count INTEGER NOT NULL DEFAULT 0
);

-- 回执上的更换部件及照片，与 hazard_item 逐项对账
CREATE TABLE IF NOT EXISTS receipt_part (
  id INTEGER PRIMARY KEY,
  receipt_id INTEGER NOT NULL,
  item_code TEXT NOT NULL,
  part_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  photo_urls TEXT
);

-- 对账明细：每条隐患条目的配/不配结果与原因，供物业主管复核
CREATE TABLE IF NOT EXISTS reconcile_line (
  id INTEGER PRIMARY KEY,
  receipt_id INTEGER NOT NULL,
  item_code TEXT NOT NULL,
  expected_part_name TEXT,
  receipt_part_name TEXT,
  required_quantity INTEGER,
  receipt_quantity INTEGER,
  photo_ok BOOLEAN,
  matched BOOLEAN NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
