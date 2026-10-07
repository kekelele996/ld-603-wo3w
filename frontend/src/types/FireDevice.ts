export interface FireDevice {
  id: number;
  building_id: number;
  device_code: string;
  device_type: string;
  floor: string;
  location_desc: string;
  install_date: string;
  status: string;
  next_maintenance_at: string;
  // 回执对账确认后由物业主管复核写回的合格部件累计数
  qualified_part_count: number;
}
