import { useEffect } from "react";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate } from "../utils/formatters";

export function DevicesPage() {
  const { rows, load } = useFireDeviceStore();
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="devices-page">
      <header className="panel">
        <h2>消防设备台账</h2>
        <p className="muted">合格部件数在回执对账经物业主管复核确认后写回本档案。</p>
      </header>
      {rows.length === 0 && <EmptyState title="暂无设备" />}
      <table className="detail-table">
        <thead>
          <tr><th>编号</th><th>类型</th><th>位置</th><th>下次维保</th><th>状态</th><th>合格部件数</th></tr>
        </thead>
        <tbody>
          {rows.map((device) => (
            <tr key={device.id}>
              <td><code>{device.device_code}</code></td>
              <td>{device.device_type}</td>
              <td><DeviceLocationCell title="" value={`${device.floor} ${device.location_desc}`} /></td>
              <td>{formatDate(device.next_maintenance_at)}</td>
              <td><StatusBadge value={device.status} /></td>
              <td><strong>{device.qualified_part_count}</strong> 件</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
